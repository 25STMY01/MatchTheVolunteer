/**
 * Shared utilities for xlsx parsing scripts.
 * Loads .env for local dev config (VOLUNTEER_SHEET_URL, etc.).
 */
import 'dotenv/config';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import XLSX from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const defaultVolunteer = join(rootDir, 'local_data', '1. Volunteer Masterlist.xlsx');
const defaultCase = join(rootDir, 'local_data', 'Case Masterlist.xlsx');

export const paths = {
  volunteer: process.env.VOLUNTEER_XLSX_PATH || defaultVolunteer,
  case: process.env.CASE_XLSX_PATH || defaultCase,
  sheetsTs: join(rootDir, 'src', 'server', 'types', 'sheets.ts'),
};

export function findHeaderRowIndex(data, identifierColumns = ['Code Number', 'SN']) {
  for (let r = 0; r < Math.min(5, data.length); r++) {
    const row = data[r] || [];
    for (let c = 0; c < row.length; c++) {
      const cell = row[c] != null ? String(row[c]) : '';
      if (identifierColumns.some((id) => cell.includes(id))) {
        return r;
      }
    }
  }
  return 0;
}

export function parseXlsx(filePath, identifierColumns = ['Code Number', 'SN']) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const headerRowIdx = findHeaderRowIndex(data, identifierColumns);
  const headers = (data[headerRowIdx] || []).map((h) => (h != null ? String(h) : ''));
  const rows = data
    .slice(headerRowIdx + 1)
    .filter((row) => row && row.some((c) => c != null && c !== ''));
  return { headers, rows };
}

export function ensureXlsxFilesExist() {
  if (!existsSync(paths.volunteer)) {
    console.error(`Error: Volunteer xlsx not found at ${paths.volunteer}`);
    console.error('Please add local_data/1. Volunteer Masterlist.xlsx');
    process.exit(1);
  }
  if (!existsSync(paths.case)) {
    console.error(`Error: Case xlsx not found at ${paths.case}`);
    console.error('Please add local_data/Case Masterlist.xlsx');
    process.exit(1);
  }
}
