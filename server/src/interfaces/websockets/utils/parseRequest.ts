import type { IncomingMessage } from "http";
import { URL } from "url";

import { logger } from "../../../infrastructure/logging/logger";

export interface UpgradeRequestParams {
  pathname: string;
  token: string;
  boardId: string;
}

export function parseUpgradeRequest(
  request: IncomingMessage,
): UpgradeRequestParams {
  if (!request.url) {
    const error = new Error("Missing request URL.");

    logger.error({ err: error }, error.message);
    throw error;
  }

  let url: URL;

  try {
    /**
     * IncomingMessage.url contains only the request path.
     * A dummy origin is required to construct a URL instance.
     */
    url = new URL(request.url, "http://localhost");
  } catch (cause) {
    const error = new Error("Invalid request URL.", { cause });

    logger.error({ err: error }, error.message);
    throw error;
  }

  const token = getRequiredQueryParam(url, "token");
  const boardId = getRequiredQueryParam(url, "boardId");

  return {
    pathname: url.pathname,
    token,
    boardId,
  };
}

function getRequiredQueryParam(url: URL, key: string): string {
  const value = url.searchParams.get(key);

  if (!value) {
    const error = new Error(`Missing '${key}' query parameter.`);

    logger.error(
      {
        err: error,
        pathname: url.pathname,
      },
      error.message,
    );

    throw error;
  }

  return value;
}
