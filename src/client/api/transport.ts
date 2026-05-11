/**
 * Single entry for calling server logic: GAS when hosted on Google, HTTP RPC when on Vite + local API.
 */
import { GASClient } from 'gas-client';
import type * as ServerTypes from '../../server';
import type {
  RpcArgs,
  RpcHandlerName,
  RpcReturn,
} from '../../server/rpcHandlers';

function gasAllowedOrigins(origin: string): boolean {
  return (
    /https:\/\/.*\.googleusercontent\.com$/.test(origin) ||
    /https:\/\/script\.google\.com$/.test(origin) ||
    /localhost/.test(origin) ||
    /127\.0\.0\.1/.test(origin)
  );
}

export function isGasAvailable(): boolean {
  return (
    typeof (window as { google?: { script?: { run?: unknown } } }).google
      ?.script?.run !== 'undefined'
  );
}

let gasClient: GASClient<typeof ServerTypes> | null = null;

function getGasClient(): GASClient<typeof ServerTypes> {
  if (!gasClient) {
    gasClient = new GASClient<typeof ServerTypes>({
      allowedDevelopmentDomains: gasAllowedOrigins,
    });
  }
  return gasClient;
}

async function localRpc<T>(name: RpcHandlerName, args: unknown[]): Promise<T> {
  const res = await fetch('/api/rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ function: name, args }),
  });
  const data = (await res.json()) as {
    ok: boolean;
    result?: T;
    error?: string;
  };
  if (!data.ok) {
    throw new Error(data.error || 'Local API request failed');
  }
  return data.result as T;
}

async function googleRpc<T>(name: RpcHandlerName, args: unknown[]): Promise<T> {
  const fns = getGasClient().serverFunctions as unknown as Record<
    RpcHandlerName,
    (...a: unknown[]) => unknown
  >;
  const fn = fns[name];
  if (typeof fn !== 'function') {
    throw new Error(`Unknown GAS function: ${String(name)}`);
  }
  return fn(args) as T
}

/**
 * Call a server RPC by name. Args match `rpcHandlers[name]`; return type is the fulfilled
 * result (`Awaited<ReturnType<…>>`), same as deserialized JSON from local RPC or GAS.
 */
export async function invokeRpc<K extends RpcHandlerName>(
  name: K,
  ...args: RpcArgs<K>
): Promise<RpcReturn<K>> {
  const argArray = args as unknown as unknown[];
  if (isGasAvailable()) {
    return googleRpc<RpcReturn<K>>(name, argArray);
  }
  return localRpc<RpcReturn<K>>(name, argArray);
}
