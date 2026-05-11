/**
 * Local HTTP RPC for `yarn dev` — dispatches by name via `rpcHandlers` (no per-endpoint switch).
 *
 * The entry `main()` must not return while the server runs: once it resolves, some
 * environments drain the loop and exit even though `listen` fired. We await shutdown
 * on SIGINT/SIGTERM instead.
 *
 * Binds the HTTP port first; repository warmup runs on the next event-loop turn so
 * clients can connect before XLSX load finishes (handlers still use the same singletons).
 */
/* eslint-disable import/no-extraneous-dependencies, no-console -- dev-only */
import 'dotenv/config';
import { initAllRepositories } from '../src/server/repository/utils.ts';

const API_PORT = Number(process.env.MTV_LOCAL_API_PORT) || 3001;

type RpcBody = { function: string; args?: unknown[] };

async function main() {
  const { default: express } = await import('express');
  const { isRpcHandlerName, rpcHandlers } = await import(
    '../src/server/rpcHandlers.ts'
  );

  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/rpc', async (req, res) => {
    const body = req.body as RpcBody;
    const fn = body?.function;
    const args = Array.isArray(body?.args) ? body.args : [];

    if (!fn || !isRpcHandlerName(fn)) {
      res.status(400).json({ ok: false, error: `Unknown function: ${fn}` });
      return;
    }

    try {
      const handler = rpcHandlers[fn] as (...a: unknown[]) => unknown;
      const result = await Promise.resolve(handler(...args));
      res.json({ ok: true, result });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      res.status(200).json({ ok: false, error: message });
    }
  });

  const server = app.listen(API_PORT, () => {
    console.log(`[mtv-local-api] http://127.0.0.1:${API_PORT} (POST /rpc)`);
    console.log('[mtv-local-api] warming repositories, please wait...');
    setImmediate(() => {
      try {
        initAllRepositories(true);
        console.log('[mtv-local-api] repositories warmed, server ready!');
      } catch (e) {
        console.error('[mtv-local-api] repository init failed', e);
        process.exit(1);
      }
    });
  });

  server.on('error', (err) => {
    console.error('[mtv-local-api] server error', err);
    process.exit(1);
  });

  await new Promise<void>((resolve) => {
    const stop = () => {
      server.close(() => resolve());
    };
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
  });
}

main().catch((err) => {
  console.error('[mtv-local-api] fatal', err);
  process.exit(1);
});
