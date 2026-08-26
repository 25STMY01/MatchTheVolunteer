/**
 * External: Singapore OneMap API integration for Geocoding, Public Transport Routing,
 * and live token generation/refresh via the OneMap Authentication Service.
 * Supports both Node.js (via global `fetch`) and Google Apps Script (via `UrlFetchApp`).
 *
 * @see https://www.onemap.gov.sg/apidocs/
 */
import { CONFIG, getScriptProperty } from '../config';
import { safeLog } from '../utils/misc';

const ONEMAP_AUTH_URL = 'https://www.onemap.gov.sg/api/auth/post/getToken';
const ONEMAP_SEARCH_URL = 'https://www.onemap.gov.sg/api/common/elastic/search';
const ONEMAP_ROUTE_URL = 'https://www.onemap.gov.sg/api/public/routingsvc/route';

export interface Coordinates {
  lat: number;
  lng: number;
}

interface CachedToken {
  token: string;
  expiresAtMs: number;
}

// In-memory caches to prevent repeated network requests
let cachedToken: CachedToken | null = null;
const geocodeCache = new Map<string, Coordinates | null>();
const routeCache = new Map<string, number | null>();

/**
 * Perform an HTTP POST request in either Node.js or Google Apps Script.
 */
async function httpPost(
  url: string,
  body: Record<string, unknown>,
  headers: Record<string, string> = {}
): Promise<{ status: number; text: string; data?: any }> {
  const payload = JSON.stringify(body);

  if (typeof UrlFetchApp !== 'undefined') {
    try {
      const resp = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        headers,
        payload,
        muteHttpExceptions: true,
      });
      const status = resp.getResponseCode();
      const text = resp.getContentText();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        // Not JSON
      }
      return { status, text, data };
    } catch (e) {
      safeLog(`OneMap httpPost (GAS) exception: ${(e as Error).toString()}`);
      return { status: 500, text: (e as Error).toString() };
    }
  }

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: payload,
    });
    const text = await resp.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      // Not JSON
    }
    return { status: resp.status, text, data };
  } catch (e) {
    safeLog(`OneMap httpPost (Node) exception: ${(e as Error).toString()}`);
    return { status: 500, text: (e as Error).toString() };
  }
}

/**
 * Perform an HTTP GET request in either Node.js or Google Apps Script.
 */
async function httpGet(
  url: string,
  headers: Record<string, string> = {}
): Promise<{ status: number; text: string; data?: any }> {
  if (typeof UrlFetchApp !== 'undefined') {
    try {
      const resp = UrlFetchApp.fetch(url, {
        method: 'get',
        headers,
        muteHttpExceptions: true,
      });
      const status = resp.getResponseCode();
      const text = resp.getContentText();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        // Not JSON
      }
      return { status, text, data };
    } catch (e) {
      safeLog(`OneMap httpGet (GAS) exception: ${(e as Error).toString()}`);
      return { status: 500, text: (e as Error).toString() };
    }
  }

  try {
    const resp = await fetch(url, {
      method: 'GET',
      headers,
    });
    const text = await resp.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      // Not JSON
    }
    return { status: resp.status, text, data };
  } catch (e) {
    safeLog(`OneMap httpGet (Node) exception: ${(e as Error).toString()}`);
    return { status: 500, text: (e as Error).toString() };
  }
}

/**
 * Authenticate with OneMap API using email & password to retrieve a fresh JWT access token.
 */
async function fetchTokenFromAuthService(): Promise<string | null> {
  const email =
    CONFIG.ONEMAP_EMAIL ||
    getScriptProperty(CONFIG.ONEMAP_EMAIL_PROPERTY) ||
    getScriptProperty('ONEMAP_EMAIL');
  const password =
    CONFIG.ONEMAP_PASSWORD ||
    getScriptProperty(CONFIG.ONEMAP_PASSWORD_PROPERTY) ||
    getScriptProperty('ONEMAP_PASSWORD');

  if (!email || !password) {
    return null;
  }

  try {
    const res = await httpPost(ONEMAP_AUTH_URL, { email, password });
    if (res.status === 200 && res.data && res.data.access_token) {
      const token = res.data.access_token as string;
      const expiryTimestampSec = res.data.expiry_timestamp
        ? Number(res.data.expiry_timestamp)
        : null;

      const expiresAtMs =
        expiryTimestampSec && !Number.isNaN(expiryTimestampSec)
          ? expiryTimestampSec * 1000
          : Date.now() + 70 * 3600 * 1000; // default ~70h

      cachedToken = { token, expiresAtMs };
      safeLog('[OneMap] Successfully retrieved fresh access token from auth service');
      return token;
    }
    safeLog(`[OneMap] Token auth failed (HTTP ${res.status}): ${res.text.substring(0, 120)}`);
  } catch (e) {
    safeLog(`[OneMap] Token auth exception: ${(e as Error).toString()}`);
  }

  return null;
}

/**
 * Get a valid OneMap access token, reusing cached token if unexpired, or fetching
 * a live token using ONEMAP_EMAIL & ONEMAP_PASSWORD credentials.
 */
export async function getValidOneMapToken(forceRefresh = false): Promise<string | null> {
  // If we have a non-expired cached token and forceRefresh is not requested
  if (!forceRefresh && cachedToken) {
    // 5-minute safety buffer before expiration
    if (Date.now() < cachedToken.expiresAtMs - 5 * 60 * 1000) {
      return cachedToken.token;
    }
  }

  // Attempt live generation via auth credentials
  const liveToken = await fetchTokenFromAuthService();
  if (liveToken) {
    return liveToken;
  }

  // Fallback to static token in config if present
  const staticToken =
    CONFIG.ONEMAP_API_TOKEN ||
    getScriptProperty(CONFIG.ONEMAP_API_TOKEN_PROPERTY) ||
    getScriptProperty('ONEMAP_TOKEN');

  if (staticToken) {
    return staticToken;
  }

  if (typeof PropertiesService !== 'undefined') {
    safeLog('WARNING: Neither ONEMAP_EMAIL/ONEMAP_PASSWORD nor ONEMAP_API_TOKEN are set');
  }

  return null;
}

/**
 * Normalizes query string for Singapore OneMap address search.
 */
function cleanSearchQuery(raw: string): string {
  return raw
    .replace(/,\s*Singapore$/i, '')
    .replace(/,\s*SG$/i, '')
    .replace(/\(patient's address\)/gi, '')
    .replace(/\([^)]*\)/g, '')
    .trim();
}

/**
 * Geocode a Singapore address, area, or postal code into latitude and longitude.
 */
export async function geocodeAddress(
  rawAddress: string | null | undefined
): Promise<Coordinates | null> {
  if (!rawAddress) return null;

  const normalized = cleanSearchQuery(rawAddress);
  if (!normalized || normalized.toUpperCase() === 'NA' || normalized.toUpperCase() === 'N/A') {
    return null;
  }

  const cacheKey = normalized.toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey) ?? null;
  }

  // Determine search terms (try full string, then first token if comma/slash separated)
  const candidateQueries = [normalized];
  if (normalized.includes(',')) {
    const parts = normalized.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) {
      candidateQueries.push(parts[0]);
    }
  } else if (normalized.includes('/')) {
    const parts = normalized.split('/').map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) {
      candidateQueries.push(parts[0]);
    }
  }

  const token = await getValidOneMapToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = token;
  }

  for (const query of candidateQueries) {
    const url = `${ONEMAP_SEARCH_URL}?searchVal=${encodeURIComponent(query)}&returnGeom=Y&getAddrDetails=Y`;
    const res = await httpGet(url, headers);

    if (res.status === 200 && res.data && res.data.results && res.data.results.length > 0) {
      const first = res.data.results[0];
      const lat = parseFloat(first.LATITUDE);
      const lng = parseFloat(first.LONGITUDE);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        const coords = { lat, lng };
        geocodeCache.set(cacheKey, coords);
        return coords;
      }
    }
  }

  geocodeCache.set(cacheKey, null);
  return null;
}

/**
 * Gets travel time in minutes by public transport between start and end coordinates.
 */
export async function getPublicTransportTravelTime(
  start: Coordinates,
  end: Coordinates
): Promise<number | null> {
  const startStr = `${start.lat.toFixed(6)},${start.lng.toFixed(6)}`;
  const endStr = `${end.lat.toFixed(6)},${end.lng.toFixed(6)}`;

  // If start and end are practically identical (same location)
  if (Math.abs(start.lat - end.lat) < 0.0001 && Math.abs(start.lng - end.lng) < 0.0001) {
    return 0;
  }

  const cacheKey = `${startStr}->${endStr}`;
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey) ?? null;
  }

  let token = await getValidOneMapToken();
  if (!token) {
    safeLog('[OneMap] Cannot compute route: No access token available');
    return null;
  }

  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const yyyy = now.getFullYear();
  const dateStr = `${mm}-${dd}-${yyyy}`;
  const timeStr = '09:00:00';

  const routeUrl = `${ONEMAP_ROUTE_URL}?start=${startStr}&end=${endStr}&routeType=pt&date=${dateStr}&time=${timeStr}&mode=transit&maxWalkDistance=1000`;

  let res = await httpGet(routeUrl, { Authorization: token });

  // If 401 Unauthorized, token might be expired: force-refresh once and retry
  if (res.status === 401) {
    safeLog('[OneMap] Received 401 from routing API, refreshing token...');
    cachedToken = null;
    token = await getValidOneMapToken(true);
    if (token) {
      res = await httpGet(routeUrl, { Authorization: token });
    }
  }

  if (res.status !== 200 || !res.data) {
    safeLog(`[OneMap] Route API returned status ${res.status}: ${res.text.substring(0, 150)}`);
    return null;
  }

  const data = res.data;

  // Check itineraries under plan
  if (data.plan && Array.isArray(data.plan.itineraries) && data.plan.itineraries.length > 0) {
    const durations = data.plan.itineraries
      .map((it: any) => it.duration)
      .filter((d: any) => typeof d === 'number' && d > 0);

    if (durations.length > 0) {
      const minSeconds = Math.min(...durations);
      const minutes = Math.round(minSeconds / 60);
      routeCache.set(cacheKey, minutes);
      return minutes;
    }
  }

  // Check route_summary
  if (data.route_summary && typeof data.route_summary.total_time === 'number' && data.route_summary.total_time > 0) {
    const minutes = Math.round(data.route_summary.total_time / 60);
    routeCache.set(cacheKey, minutes);
    return minutes;
  }

  routeCache.set(cacheKey, null);
  return null;
}

/**
 * Computes public transport travel times (in minutes) from multiple volunteer origin addresses
 * to a single patient destination address.
 * Blank or unresolvable entries return `null`.
 */
export async function batchComputeVolunteerTravelTimes(
  volunteerAddresses: (string | null | undefined)[],
  patientAddress: string
): Promise<(number | null)[]> {
  const patientCoords = await geocodeAddress(patientAddress);
  if (!patientCoords) {
    safeLog(`[OneMap] Could not geocode patient address: "${patientAddress}"`);
    return volunteerAddresses.map(() => null);
  }

  // Geocode all volunteer locations concurrently
  const volunteerCoordsList = await Promise.all(
    volunteerAddresses.map((addr) => geocodeAddress(addr))
  );

  // Compute travel times for all volunteers with valid coordinates concurrently
  const results: (number | null)[] = await Promise.all(
    volunteerCoordsList.map(async (volCoords) => {
      if (!volCoords) return null;
      return getPublicTransportTravelTime(volCoords, patientCoords);
    })
  );

  return results;
}
