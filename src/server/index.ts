/**
 * Web app entry point - serves the React UI
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('match-the-volunteer');
}

export { doGet };
export * from './handlers';
