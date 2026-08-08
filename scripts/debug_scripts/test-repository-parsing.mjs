#!/usr/bin/env node

/**
 * Standalone XLSX inspection script for volunteer data.
 * Usage: node scripts/debug_scripts/test-repository-parsing.mjs
 *
 * This mirrors the repository parsing logic without importing app source.
 */

import XLSX from 'xlsx';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const volunteerFilePath = join(__dirname, '../../local_data/1. Volunteer Masterlist.xlsx');

function normalize(value) {
  return String(value ?? '').trim();
}

function findHeaderRow(rawData) {
  for (let i = 0; i < Math.min(20, rawData.length); i++) {
    const rowText = rawData[i].map(String).join('|').toLowerCase();
    if (rowText.includes('code')) return i;
  }
  return -1;
}

console.log('═'.repeat(80));
console.log('REPOSITORY PARSING TEST (standalone XLSX version)');
console.log('═'.repeat(80));

const workbook = XLSX.readFile(volunteerFilePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

const headerRowIdx = findHeaderRow(rawData);
if (headerRowIdx < 0) {
  console.error('Could not find header row.');
  process.exit(1);
}

const headers = (rawData[headerRowIdx] ?? []).map((h) => String(h ?? ''));
const dataRows = rawData.slice(headerRowIdx + 1).filter((row) => row && row.some((c) => c != null && c !== ''));

const keyColumns = {
  code: headers.findIndex((h) => h.toLowerCase().includes('code')),
  gender: headers.findIndex((h) => h.toLowerCase().includes('gender') || h.toLowerCase().includes('性别')),
  religion: headers.findIndex((h) => h.toLowerCase().includes('religion') || h.toLowerCase().includes('宗教')),
  languages: headers.findIndex((h) => h.toLowerCase().includes('spoken') || h.toLowerCase().includes('口语')),
};

console.log(`Sheet: ${sheetName}`);
console.log(`Header row: ${headerRowIdx}`);
console.log(`Valid volunteer rows: ${dataRows.length}`);
console.log('');
console.log('Key columns:');
console.log(`  Code: ${keyColumns.code >= 0 ? headers[keyColumns.code] : 'NOT FOUND'}`);
console.log(`  Gender: ${keyColumns.gender >= 0 ? headers[keyColumns.gender] : 'NOT FOUND'}`);
console.log(`  Religion: ${keyColumns.religion >= 0 ? headers[keyColumns.religion] : 'NOT FOUND'}`);
console.log(`  Languages: ${keyColumns.languages >= 0 ? headers[keyColumns.languages] : 'NOT FOUND'}`);

console.log('\nSample rows:');
for (const row of dataRows.slice(0, 10)) {
  console.log('---');
  console.log(`Code: ${normalize(row[keyColumns.code])}`);
  console.log(`Gender: ${normalize(row[keyColumns.gender])}`);
  console.log(`Religion: ${normalize(row[keyColumns.religion])}`);
  console.log(`Languages: ${normalize(row[keyColumns.languages])}`);
}

const genders = new Map();
const religions = new Map();
const languages = new Map();

for (const row of dataRows) {
  const gender = normalize(row[keyColumns.gender]).toLowerCase();
  const religion = normalize(row[keyColumns.religion]).toLowerCase();
  const spoken = normalize(row[keyColumns.languages]);

  if (gender) genders.set(gender, (genders.get(gender) ?? 0) + 1);
  if (religion) religions.set(religion, (religions.get(religion) ?? 0) + 1);

  if (spoken) {
    for (const lang of spoken.split(/[,/]+/).map((s) => s.trim().toLowerCase()).filter(Boolean)) {
      languages.set(lang, (languages.get(lang) ?? 0) + 1);
    }
  }
}

console.log('\nExtracted unique values:');
console.log(`  Genders (${genders.size}): ${Array.from(genders.keys()).sort().join(', ')}`);
console.log(`  Religions (${religions.size}): ${Array.from(religions.keys()).sort().join(', ')}`);
console.log(`  Languages (${languages.size}): ${Array.from(languages.keys()).sort().join(', ')}`);

console.log('\nTop language entries:');
Array.from(languages.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .forEach(([lang, count]) => console.log(`  ${lang}: ${count}`));

console.log(`\n${'═'.repeat(80)}\n`);
