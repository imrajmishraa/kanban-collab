/**
 * The app's reporter, built once from the environment.
 *
 * Kept out of `errorReporter.ts` on purpose: that module is imported by tests,
 * and it must not pull in `config/env` (which reads `process.env`, validates it
 * and loads dotenv). The factory is pure; the instance is wired here.
 */
import { ENV } from "../../config/env";

import { createErrorReporter } from "./errorReporter";

export const errorReporter = createErrorReporter({
  url: ENV.ERROR_WEBHOOK_URL,
  release: ENV.APP_RELEASE,
  environment: ENV.NODE_ENV,
});

export type { ErrorContext, ErrorReporter } from "./errorReporter";
