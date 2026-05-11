import { existsSync } from 'fs';
import { dirname, isAbsolute, join } from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import type { CaseRow } from '../../../types/sheets';
import { CONFIG } from '../../config';
import { findHeaderRowIndex } from '../../utils/sheets';
import { rowToObject } from '../utils';

const defaultCaseXlsxPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
  '..',
  'local_data',
  'Case Masterlist.xlsx'
);

function resolveCaseXlsxPath(): string {
  const fromEnv = process.env.CASE_XLSX_PATH;
  if (fromEnv) {
    return isAbsolute(fromEnv) ? fromEnv : join(process.cwd(), fromEnv);
  }
  return defaultCaseXlsxPath;
}

function pickSheetName(sheetNames: string[]): string {
  const preferred = CONFIG.CASE_SHEET_NAME;
  if (sheetNames.includes(preferred)) {
    return preferred;
  }
  return sheetNames[0] ?? '';
}

/** Node / local dev only — loads the same logical grid as the Google Sheet path in GAS. */
export function readCaseRowsFromLocalCaseXlsx(): CaseRow[] {
  const filePath = resolveCaseXlsxPath();
  if (!existsSync(filePath)) {
    throw new Error(
      `Case XLSX not found at ${filePath}. Set CASE_XLSX_PATH or add local_data/Case Masterlist.xlsx`
    );
  }
  const workbook = XLSX.readFile(filePath);
  const sheetName = pickSheetName(workbook.SheetNames);
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error(`Sheet "${sheetName}" not found in ${filePath}`);
  }
  const rawData = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
  }) as (string | number)[][];
  const headerRowIdx = findHeaderRowIndex(rawData, ['SN']);
  const headers = (rawData[headerRowIdx] ?? []).map((h) => String(h ?? ''));
  return rawData
    .slice(headerRowIdx + 1)
    .filter((row) => row && row.some((c) => c != null && c !== ''))
    .map((row) => rowToObject<CaseRow>(headers, row));
}
