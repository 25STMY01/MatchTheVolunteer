#!/usr/bin/env node

/**
 * Debug script to inspect case data in detail
 * Usage: node scripts/debug_scripts/inspect-case-data.mjs
 * 
 * This script shows the structure and sample data from Case Masterlist.xlsx
 */

import XLSX from 'xlsx';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const caseFilePath = join(__dirname, '../../local_data/Case Masterlist.xlsx');

console.log('═'.repeat(80));
console.log('CASE DATA INSPECTION SCRIPT');
console.log('═'.repeat(80));
console.log(`\nReading: ${caseFilePath}\n`);

// Read the XLSX file
let workbook;
try {
  workbook = XLSX.readFile(caseFilePath);
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

// Find header row by looking for "SN" or "Code"
let headerRowIdx = -1;
for (let i = 0; i < Math.min(20, rawData.length); i++) {
  const row = rawData[i];
  const rowText = row.map(String).join('|').toLowerCase();
  if (rowText.includes('sn') || rowText.includes('code')) {
    headerRowIdx = i;
    break;
  }
}

if (headerRowIdx === -1) {
  console.error('✗ Could not find header row');
  process.exit(1);
}

console.log(`✓ Header row found at index: ${headerRowIdx}\n`);

const headers = (rawData[headerRowIdx] ?? []).map((h) => String(h ?? ''));
console.log(`Headers (${headers.length} total):\n`);

// Display all headers for reference
headers.forEach((h, i) => {
  if (h) console.log(`  [${String(i).padStart(2)}] ${h}`);
});

// Extract data rows
const dataRows = rawData.slice(headerRowIdx + 1).filter((row) => row && row.some((c) => c != null && c !== ''));

console.log(`\n✓ Valid data rows: ${dataRows.length}\n`);

console.log('═'.repeat(80));
console.log('SAMPLE CASE RECORDS (first 10)');
console.log('═'.repeat(80));

dataRows.slice(0, 10).forEach((row, rowIdx) => {
  console.log(`\n[Row ${rowIdx + 1}]`);
  for (let i = 0; i < headers.length; i++) {
    const value = String(row[i] || '').trim();
    if (value && headers[i]) {
      console.log(`  ${headers[i]}: "${value}"`);
    }
  }
});

console.log(`\n${'═'.repeat(80)}\n`);
