import { existsSync } from 'fs';
import { dirname, isAbsolute, join } from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import type { VolunteerRow } from '../../../types/sheets';
import { CONFIG } from '../../config';
import { findHeaderRowIndex } from '../../utils/sheets';
import { rowToObject } from '../utils';

const defaultVolunteerXlsxPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
  '..',
  'local_data',
  '1. Volunteer Masterlist.xlsx'
);

function resolveVolunteerXlsxPath(): string {
  const fromEnv = process.env.VOLUNTEER_XLSX_PATH;
  if (fromEnv) {
    return isAbsolute(fromEnv) ? fromEnv : join(process.cwd(), fromEnv);
  }
  return defaultVolunteerXlsxPath;
}

function pickSheetName(sheetNames: string[]): string {
  const preferred = CONFIG.VOLUNTEER_SHEET_NAME;
  if (sheetNames.includes(preferred)) {
    return preferred;
  }
  return sheetNames[0] ?? '';
}

/** Node / local dev only — same shape as the volunteer Google Sheet. */
export function readVolunteerRowsFromLocalVolunteerXlsx(): VolunteerRow[] {
  const filePath = resolveVolunteerXlsxPath();
  if (!existsSync(filePath)) {
    throw new Error(
      `Volunteer XLSX not found at ${filePath}. Set VOLUNTEER_XLSX_PATH or add local_data/1. Volunteer Masterlist.xlsx`
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
  const headerRowIdx = findHeaderRowIndex(rawData, ['Code Number']);
  const headers = (rawData[headerRowIdx] ?? []).map((h) => String(h ?? ''));
  return rawData
    .slice(headerRowIdx + 1)
    .filter((row) => row && row.some((c) => c != null && c !== ''))
    .map((row) => rowToObject<VolunteerRow>(headers, row));
}
