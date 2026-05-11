/**
 * External: Google Maps Routes API — `computeRouteMatrix` (Route Matrix over REST).
 * Same product as the Maps JavaScript Route Matrix class; server-side uses this POST endpoint.
 *
 * @see https://developers.google.com/maps/documentation/routes/compute_route_matrix
 */
import type { RouteMatrixElementJson } from '../../types/external';
import { CONFIG, getScriptProperty } from '../config';
import { safeLog } from '../utils/misc';

const ROUTES_MATRIX_URL =
  'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix';

/** Required field mask — must include `status` per API docs. */
const MATRIX_FIELD_MASK =
  'originIndex,destinationIndex,status,condition,distanceMeters';

/** Origins + destinations that use `address` (or placeId) may not exceed 50 total. */
const MAX_ADDRESS_WAYPOINTS_SUM = 50;

function getApiKey(): string | null {
  const key = getScriptProperty(CONFIG.GOOGLE_MAPS_API_KEY_PROPERTY);
  if (!key && typeof PropertiesService !== 'undefined') {
    safeLog('ERROR: GOOGLE_MAPS_API_KEY not set in Script Properties');
  }
  return key;
}

function waypointFromAddress(address: string): { address: string } {
  return { address };
}

function buildComputeRouteMatrixBody(
  origin: string,
  destinationAddresses: string[]
): Record<string, unknown> {
  return {
    origins: [{ waypoint: waypointFromAddress(origin) }],
    destinations: destinationAddresses.map((d) => ({
      waypoint: waypointFromAddress(d),
    })),
    travelMode: 'DRIVE',
    routingPreference: 'TRAFFIC_UNAWARE',
    regionCode: 'SG',
  };
}

type MatrixParseResult =
  | { ok: true; elements: RouteMatrixElementJson[] }
  | { ok: false; message: string };

function parseComputeRouteMatrixResponse(responseText: string): MatrixParseResult {
  let data: unknown;
  try {
    data = JSON.parse(responseText) as unknown;
  } catch {
    return { ok: false, message: 'Invalid JSON from Routes matrix API' };
  }

  if (Array.isArray(data)) {
    return { ok: true, elements: data as RouteMatrixElementJson[] };
  }

  if (data && typeof data === 'object' && 'error' in data) {
    const err = (data as { error?: { message?: string; status?: string } })
      .error;
    const msg = err?.message || err?.status || 'Routes matrix API error';
    return { ok: false, message: msg };
  }

  return { ok: false, message: 'Unexpected Routes matrix response shape' };
}

function elementToKm(el: RouteMatrixElementJson): number | null {
  if (el.condition === 'ROUTE_NOT_FOUND') {
    return null;
  }
  const m = el.distanceMeters;
  if (m == null || typeof m !== 'number') {
    return null;
  }
  return m / 1000.0;
}

function applyMatrixBatchToOutput(
  out: (number | null)[],
  batchStart: number,
  indexMap: number[],
  elements: RouteMatrixElementJson[]
): void {
  for (const el of elements) {
    const destIdx = el.destinationIndex;
    if (destIdx == null || destIdx < 0) {
      continue;
    }
    const addrOffset = batchStart + destIdx;
    if (addrOffset >= indexMap.length) {
      continue;
    }
    const originalRow = indexMap[addrOffset];
    const km = elementToKm(el);
    if (km != null && !Number.isNaN(km)) {
      out[originalRow] = km;
    }
  }
}

function matrixPostGas(apiKey: string, body: string): [number, string] {
  const resp = UrlFetchApp.fetch(ROUTES_MATRIX_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': MATRIX_FIELD_MASK,
    },
    payload: body,
    muteHttpExceptions: true,
  });
  return [resp.getResponseCode(), resp.getContentText()];
}

async function matrixPostFetch(
  apiKey: string,
  body: string
): Promise<[number, string]> {
  const resp = await fetch(ROUTES_MATRIX_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': MATRIX_FIELD_MASK,
    },
    body,
  });
  const text = await resp.text();
  return [resp.status, text];
}

function computeRouteMatrixDistancesKmGas(
  origin: string,
  destinationAddresses: string[]
): (number | null)[] | { error: string } {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { error: 'API key not set in Script Properties' };
  }

  const o = origin?.trim();
  if (!o) {
    return { error: 'Origin must be non-empty' };
  }

  const n = destinationAddresses.length;
  const out: (number | null)[] = Array(n).fill(null);
  const indexMap: number[] = [];
  const addrs: string[] = [];

  for (let i = 0; i < n; i += 1) {
    const t = destinationAddresses[i]?.trim();
    if (t) {
      indexMap.push(i);
      addrs.push(t);
    }
  }

  if (addrs.length === 0) {
    return out;
  }

  const maxPerBatch = MAX_ADDRESS_WAYPOINTS_SUM - 1;

  try {
    for (let start = 0; start < addrs.length; start += maxPerBatch) {
      const batchAddrs = addrs.slice(start, start + maxPerBatch);
      const body = JSON.stringify(buildComputeRouteMatrixBody(o, batchAddrs));
      const [responseCode, responseText] = matrixPostGas(apiKey, body);
      if (responseCode !== 200) {
        const msg = `HTTP ${responseCode}: ${responseText.substring(0, 200)}`;
        safeLog(`ERROR: Routes matrix ${msg}`);
        return { error: msg };
      }
      const parsed = parseComputeRouteMatrixResponse(responseText);
      if (!parsed.ok) {
        safeLog(`ERROR: Routes matrix: ${parsed.message}`);
        return { error: parsed.message };
      }
      applyMatrixBatchToOutput(out, start, indexMap, parsed.elements);
    }
    return out;
  } catch (e) {
    const msg = `Exception: ${(e as Error).toString()}`;
    safeLog(`ERROR computeRouteMatrixDistancesKmGas: ${msg}`);
    return { error: msg };
  }
}

async function computeRouteMatrixDistancesKmNode(
  origin: string,
  destinationAddresses: string[]
): Promise<(number | null)[] | { error: string }> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { error: 'API key not set (GOOGLE_MAPS_API_KEY)' };
  }

  const o = origin?.trim();
  if (!o) {
    return { error: 'Origin must be non-empty' };
  }

  const n = destinationAddresses.length;
  const out: (number | null)[] = Array(n).fill(null);
  const indexMap: number[] = [];
  const addrs: string[] = [];

  for (let i = 0; i < n; i += 1) {
    const t = destinationAddresses[i]?.trim();
    if (t) {
      indexMap.push(i);
      addrs.push(t);
    }
  }

  if (addrs.length === 0) {
    return out;
  }

  const maxPerBatch = MAX_ADDRESS_WAYPOINTS_SUM - 1;

  try {
    for (let start = 0; start < addrs.length; start += maxPerBatch) {
      const batchAddrs = addrs.slice(start, start + maxPerBatch);
      const body = JSON.stringify(buildComputeRouteMatrixBody(o, batchAddrs));
      const [responseCode, responseText] = await matrixPostFetch(apiKey, body);
      if (responseCode !== 200) {
        const msg = `HTTP ${responseCode}: ${responseText.substring(0, 200)}`;
        safeLog(`ERROR: Routes matrix ${msg}`);
        return { error: msg };
      }
      const parsed = parseComputeRouteMatrixResponse(responseText);
      if (!parsed.ok) {
        safeLog(`ERROR: Routes matrix: ${parsed.message}`);
        return { error: parsed.message };
      }
      applyMatrixBatchToOutput(out, start, indexMap, parsed.elements);
    }
    return out;
  } catch (e) {
    const msg = `Exception: ${(e as Error).toString()}`;
    safeLog(`ERROR computeRouteMatrixDistancesKmNode: ${msg}`);
    return { error: msg };
  }
}

/**
 * Driving distances (km) from one origin to many destinations, aligned to
 * `destinationAddresses` indices. Blank entries stay `null`. One matrix request
 * per batch (API address limit). Uses UrlFetchApp on GAS, `fetch` on Node.
 */
export async function computeRouteMatrixDistancesKm(
  origin: string,
  destinationAddresses: string[]
): Promise<(number | null)[] | { error: string }> {
  if (typeof UrlFetchApp !== 'undefined') {
    return Promise.resolve(
      computeRouteMatrixDistancesKmGas(origin, destinationAddresses)
    );
  }
  return computeRouteMatrixDistancesKmNode(origin, destinationAddresses);
}

function calculateDistanceGas(
  origin: string,
  destination: string
): number | { error: string } {
  if (typeof UrlFetchApp === 'undefined') {
    return { error: 'calculateDistance is only for Apps Script' };
  }
  const res = computeRouteMatrixDistancesKmGas(origin, [destination]);
  if (!Array.isArray(res)) {
    return { error: res.error };
  }
  const d0 = res[0];
  if (d0 == null) {
    return { error: 'No route or distance for pair' };
  }
  return d0;
}

async function calculateDistanceAsync(
  origin: string,
  destination: string
): Promise<number | { error: string }> {
  const res = await computeRouteMatrixDistancesKm(origin, [destination]);
  if (!Array.isArray(res)) {
    return { error: res.error };
  }
  const d0 = res[0];
  if (d0 == null) {
    return { error: 'No route or distance for pair' };
  }
  return d0;
}

export async function calculateDistance(
  origin: string,
  destination: string
): Promise<number | { error: string }> {
  if (typeof UrlFetchApp !== 'undefined') {
    return calculateDistanceGas(origin, destination);
  }
  return calculateDistanceAsync(origin, destination);
}
