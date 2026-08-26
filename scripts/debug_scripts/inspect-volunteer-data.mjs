#!/usr/bin/env node

/**
 * Debug script to inspect volunteer data in detail
 * Usage: node scripts/debug_scripts/inspect-volunteer-data.mjs
 * 
 * This script:
 * 1. Reads the Volunteer Masterlist.xlsx file
 * 2. Shows the header structure
 * 3. Displays all volunteer records with their key fields
 * 4. Analyzes the gender, religion, and language columns for patterns
 * 5. Shows how the data would be parsed by getUniqueGenders/Religions/Languages
 */

import XLSX from 'xlsx';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const volunteerFilePath = join(__dirname, '../../local_data/1. Volunteer Masterlist.xlsx');

console.log('═'.repeat(80));
console.log('VOLUNTEER DATA INSPECTION SCRIPT');
console.log('═'.repeat(80));
console.log(`\nReading: ${volunteerFilePath}\n`);

// Read the XLSX file
let workbook;
try {
  workbook = XLSX.readFile(volunteerFilePath);
  console.log(`✓ File loaded successfully`);
  console.log(`  Sheet names: ${workbook.SheetNames.join(', ')}`);
} catch (error) {
  console.error(`✗ Failed to read file: ${error.message}`);
  process.exit(1);
}

const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const rawData = XLSX.utils.sheet_to_json(worksheet, {
  header: 1,
  defval: '',
});

console.log(`\nTotal rows in sheet: ${rawData.length}`);

// Find header row by looking for "Code Number" or similar
let headerRowIdx = -1;
for (let i = 0; i < Math.min(20, rawData.length); i++) {
  const row = rawData[i];
  const rowText = row.map(String).join('|').toLowerCase();
  if (rowText.includes('code')) {
    headerRowIdx = i;
    break;
  }
}

if (headerRowIdx === -1) {
  console.error('✗ Could not find header row (looking for "Code" column)');
  process.exit(1);
}

console.log(`✓ Header row found at index: ${headerRowIdx}\n`);

const headers = (rawData[headerRowIdx] ?? []).map((h) => String(h ?? ''));
console.log(`Headers (${headers.length} total):`);

// Find key column indices
const keyColumns = {
  code: -1,
  gender: -1,
  religion: -1,
  languages: -1,
  sn: -1,
};

headers.forEach((header, idx) => {
  const h = header.toLowerCase();
  if (h.includes('code')) {
    keyColumns.code = idx;
  } else if (h.includes('gender') || h.includes('性别')) {
    keyColumns.gender = idx;
  } else if (h.includes('religion') || h.includes('宗教')) {
    keyColumns.religion = idx;
  } else if (h.includes('spoken') || h.includes('口语')) {
    keyColumns.languages = idx;
  } else if (h.includes('sn') && h.length < 5) {
    keyColumns.sn = idx;
  }
});

console.log('\nKey columns identified:');
Object.entries(keyColumns).forEach(([name, idx]) => {
  if (idx >= 0) {
    console.log(`  ${name.padEnd(12)} → [${idx}] ${headers[idx]}`);
  } else {
    console.log(`  ${name.padEnd(12)} → NOT FOUND`);
  }
});

// Extract and display data rows
const dataRows = rawData.slice(headerRowIdx + 1).filter((row) => row && row.some((c) => c != null && c !== ''));

console.log(`\n✓ Valid data rows: ${dataRows.length}\n`);

// Analysis
const analysis = {
  totalVolunteers: dataRows.length,
  genderValues: new Map(),
  religionValues: new Map(),
  languageValues: new Map(),
  rowsWithEmptyGender: 0,
  rowsWithEmptyReligion: 0,
  rowsWithEmptyLanguages: 0,
  languageDelimiters: new Set(),
};

console.log('═'.repeat(80));
console.log('DETAILED VOLUNTEER RECORDS');
console.log('═'.repeat(80));

dataRows.slice(0, 20).forEach((row, rowIdx) => {
  const code = String(row[keyColumns.code] || '').trim();
  const gender = String(row[keyColumns.gender] || '').trim();
  const religion = String(row[keyColumns.religion] || '').trim();
  const languages = String(row[keyColumns.languages] || '').trim();

  console.log(`\n[Row ${rowIdx + 1}] Code: ${code}`);
  console.log(`  Gender: "${gender}"`);
  console.log(`  Religion: "${religion}"`);
  console.log(`  Languages: "${languages}"`);

  // Track values for analysis
  if (gender) {
    analysis.genderValues.set(gender, (analysis.genderValues.get(gender) || 0) + 1);
  } else {
    analysis.rowsWithEmptyGender++;
  }

  if (religion) {
    analysis.religionValues.set(religion, (analysis.religionValues.get(religion) || 0) + 1);
  } else {
    analysis.rowsWithEmptyReligion++;
  }

  if (languages) {
    analysis.languageValues.set(languages, (analysis.languageValues.get(languages) || 0) + 1);
    // Detect delimiters
    if (languages.includes(',')) analysis.languageDelimiters.add(',');
    if (languages.includes('/')) analysis.languageDelimiters.add('/');
    if (languages.includes(';')) analysis.languageDelimiters.add(';');
    if (languages.includes('|')) analysis.languageDelimiters.add('|');
  } else {
    analysis.rowsWithEmptyLanguages++;
  }
});

// Show analysis
console.log(`\n${'═'.repeat(80)}`);
console.log('DATA ANALYSIS');
console.log('═'.repeat(80));

console.log(`\nTotal volunteers: ${analysis.totalVolunteers}`);
console.log(`Rows with empty gender: ${analysis.rowsWithEmptyGender}`);
console.log(`Rows with empty religion: ${analysis.rowsWithEmptyReligion}`);
console.log(`Rows with empty languages: ${analysis.rowsWithEmptyLanguages}`);

console.log(`\n→ Unique GENDER values (${analysis.genderValues.size}):`);
Array.from(analysis.genderValues.entries())
  .sort((a, b) => b[1] - a[1])
  .forEach(([value, count]) => {
    console.log(`  "${value}" → ${count} volunteers`);
  });

console.log(`\n→ Unique RELIGION values (${analysis.religionValues.size}):`);
Array.from(analysis.religionValues.entries())
  .sort((a, b) => b[1] - a[1])
  .forEach(([value, count]) => {
    console.log(`  "${value}" → ${count} volunteers`);
  });

console.log(`\n→ LANGUAGE DELIMITERS found: ${Array.from(analysis.languageDelimiters).map(d => `"${d}"`).join(', ') || 'NONE'}`);

console.log(`\n→ Sample LANGUAGE entries (top 10):`);
Array.from(analysis.languageValues.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([value, count]) => {
    const parsed = value.split(/[,/]+/).map(l => l.trim().toLowerCase());
    console.log(`  "${value}"`);
    console.log(`    Count: ${count}, Parsed as: [${parsed.map(l => `"${l}"`).join(', ')}]`);
  });

// What the parsing functions would extract
console.log(`\n${'═'.repeat(80)}`);
console.log('WHAT CURRENT PARSING LOGIC WOULD EXTRACT');
console.log('═'.repeat(80));

const uniqueGenders = new Set();
const uniqueReligions = new Set();
const uniqueLanguages = new Set();

dataRows.forEach((row) => {
  const gender = String(row[keyColumns.gender] || '').trim().toLowerCase();
  if (gender) uniqueGenders.add(gender);

  const religion = String(row[keyColumns.religion] || '').trim().toLowerCase();
  if (religion) uniqueReligions.add(religion);

  const languages = String(row[keyColumns.languages] || '').trim();
  if (languages) {
    const parsed = languages.split(/[,/]+/).map((l) => l.trim().toLowerCase()).filter(Boolean);
    parsed.forEach((lang) => uniqueLanguages.add(lang));
  }
});

console.log(`\n✓ Unique genders (${uniqueGenders.size}):`);
console.log(`  [${Array.from(uniqueGenders).sort().map(g => `"${g}"`).join(', ')}]`);

console.log(`\n✓ Unique religions (${uniqueReligions.size}):`);
console.log(`  [${Array.from(uniqueReligions).sort().map(r => `"${r}"`).join(', ')}]`);

console.log(`\n✓ Unique languages (${uniqueLanguages.size}):`);
console.log(`  [${Array.from(uniqueLanguages).sort().map(l => `"${l}"`).join(', ')}]`);

console.log(`\n${'═'.repeat(80)}\n`);
