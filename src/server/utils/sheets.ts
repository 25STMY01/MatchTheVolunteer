// ============================================================================
// UTILITY CLASSES
// ============================================================================

/**
 * Utility class for Google Sheets operations
 */
export function openSpreadsheet(url: string): GoogleAppsScript.Spreadsheet.Spreadsheet {
      try {
        return SpreadsheetApp.openByUrl(url);
      } catch (error) {
        throw new Error(`Failed to open spreadsheet: ${(error as Error).toString()}`);
      }
    }
  
export function getSheet(
      spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
      sheetName: string
    ): GoogleAppsScript.Spreadsheet.Sheet {
      const sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        throw new Error(`Sheet not found: ${sheetName}`);
      }
      return sheet;
    }
  
export function getAllData(sheet: GoogleAppsScript.Spreadsheet.Sheet): unknown[][] {
      return sheet.getDataRange().getValues();
    }
  
export function findHeaderRowIndex(
      data: unknown[][],
      identifierColumns: string[] = ['Code Number', 'SN']
    ): number {
      for (let r = 0; r < Math.min(30, data.length); r++) {
        const row = data[r] as unknown[];
        for (let c = 0; c < row.length; c++) {
          const cell = row[c] ? (row[c] as object).toString() : '';
          if (identifierColumns.some((id) => cell.includes(id))) {
            return r;
          }
        }
      }
      return 0;
    }

  