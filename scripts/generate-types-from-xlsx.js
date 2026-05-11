#!/usr/bin/env node
/**
 * Generates TypeScript types from local .xlsx files (default: local_data/)
 * Run: yarn generate-types
 * Output: src/server/types/sheets.ts
 */

import { writeFileSync } from 'fs';
import { paths, parseXlsx, ensureXlsxFilesExist } from './xlsx-utils.js';

function toValidIdentifier(key) {
  if (!key || typeof key !== 'string') return 'empty';
  const trimmed = key.trim();
  if (!trimmed) return 'empty';
  const escaped = trimmed.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ');
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) return trimmed;
  return `'${escaped}'`;
}

function generateInterface(name, headers) {
  const lines = headers.map((h, i) => {
    const prop = toValidIdentifier(h || `Column${i + 1}`);
    return `  ${prop}?: string | number;`;
  });
  return `export interface ${name} extends Row {\n${lines.join('\n')}\n}`;
}

function main() {
  ensureXlsxFilesExist();

  const volunteerData = parseXlsx(paths.volunteer, ['Code Number']);
  const caseData = parseXlsx(paths.case, ['SN']);

  const timestamp = new Date().toISOString();
  const output = `// AUTO-GENERATED from local .xlsx (yarn generate-types) - do not edit manually
// Generated: ${timestamp}
// Run: yarn generate-types

/** Base type for sheet row data - all row types extend this */
export interface Row {
  [key: string]: string | number | undefined;
}

${generateInterface('VolunteerRow', volunteerData.headers)}

${generateInterface('CaseRow', caseData.headers)}
`;

  writeFileSync(paths.sheetsTs, output, 'utf-8');
  console.log(`Wrote ${paths.sheetsTs}`);
}

main();
