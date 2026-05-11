// ============================================================================
// CONFIGURATION - read from GAS Script Properties
// ============================================================================
// Set these in: Project Settings → Script properties (script.google.com)
// For local dev, use .env (see .env.example)
// ============================================================================

/** Script property on GAS, or `process.env[key]` on Node / local. */
export function getScriptProperty(key: string): string | null {
  if (typeof PropertiesService !== 'undefined') {
    return PropertiesService.getScriptProperties().getProperty(key);
  }
  return typeof process !== 'undefined' && process.env
    ? process.env[key] ?? null
    : null;
}

export const CONFIG = {
  VOLUNTEER_SHEET_URL: getScriptProperty('VOLUNTEER_SHEET_URL') ?? '',
  CASE_SHEET_URL: getScriptProperty('CASE_SHEET_URL') ?? '',
  VOLUNTEER_SHEET_NAME:
    getScriptProperty('VOLUNTEER_SHEET_NAME') ?? 'Volunteer Masterlist',
  CASE_SHEET_NAME: getScriptProperty('CASE_SHEET_NAME') ?? 'Cases',
  GOOGLE_MAPS_API_KEY_PROPERTY: 'GOOGLE_MAPS_API_KEY',
};