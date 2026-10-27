/**
 * Vercel Function entry.
 *
 * Vercel matches `api/index.ts` to the `/api` path, and `vercel.json` rewrites
 * every route this app serves to it. The implementation lives under `src/` so
 * `tsc --noEmit` (and therefore CI) type-checks it; this file only re-exports.
 */
import server from "../src/serverless/handler";

export default server;
