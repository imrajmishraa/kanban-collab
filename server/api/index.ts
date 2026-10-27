/**
 * Vercel Function entry.
 *
 * Vercel matches `api/index.ts` to the `/api` path, and `vercel.json` rewrites
 * every route this app serves to it. The implementation lives under `src/`, and
 * Vercel compiles and bundles the whole import graph from this entry — so the
 * function carries the code it needs and depends on no separate build output.
 */
import server from "../src/serverless/handler";

export default server;
