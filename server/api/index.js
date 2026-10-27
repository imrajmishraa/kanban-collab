/**
 * Vercel Function entry — plain JavaScript on purpose.
 *
 * `tsconfig.json` pins `rootDir: "./src"`, and TypeScript 6 requires that to be
 * explicit. A `.ts` entry here would sit outside the rootDir, so `tsc` reports
 * TS6059 and Vercel fails the build with "Emit skipped". Keeping the entry in
 * JavaScript sidesteps the compiler entirely; the typed implementation still
 * lives in `src/` where `tsc --noEmit` and ESLint cover it.
 *
 * `vercel.json` runs `npm run build` before functions are packaged, so `dist/`
 * exists by the time this module loads. The default export of the compiled
 * handler is the `http.Server` Vercel expects.
 */
const handler = require("../dist/serverless/handler");

module.exports = handler.default ?? handler;
