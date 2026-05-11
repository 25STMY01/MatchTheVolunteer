/**
 * RPC registry built from `./handlers` exports (every exported function is callable via RPC).
 * Non-functions (e.g. future type-only re-exports) are ignored. `doGet` lives on `../index`, not here.
 */
import * as handlerModule from './handlers';

type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: never[]) => unknown ? K : never;
}[keyof T];

export type RpcHandlerName = FunctionKeys<typeof handlerModule>;

export const rpcHandlers = Object.fromEntries(
  Object.entries(handlerModule).filter(([, v]) => typeof v === 'function')
) as Pick<typeof handlerModule, RpcHandlerName>;

/** Typed `invokeRpc` on the client: args mirror `rpcHandlers[name]`. */
export type RpcHandlerMap = typeof rpcHandlers;
export type RpcArgs<K extends RpcHandlerName> = Parameters<RpcHandlerMap[K]>;
/** Fulfilled return value (async handlers unwrap `Promise<…>` — matches JSON over the wire). */
export type RpcReturn<K extends RpcHandlerName> = Awaited<
  ReturnType<RpcHandlerMap[K]>
>;

export function isRpcHandlerName(name: string): name is RpcHandlerName {
  return (
    name in handlerModule &&
    typeof (handlerModule as Record<string, unknown>)[name] === 'function'
  );
}
