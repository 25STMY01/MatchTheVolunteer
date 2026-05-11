import type { CaseRow } from '../../../types/sheets';

/** Bundled into GAS instead of the real XLSX reader — must never run in production. */
export function readCaseRowsFromLocalCaseXlsx(): CaseRow[] {
  throw new Error('readCaseRowsFromLocalCaseXlsx is only for local Node dev');
}
