interface RedirectState {
  from?: { pathname?: string; search?: string; hash?: string };
}

/**
 * Where to send someone after they sign in.
 *
 * One answer, in one place: the guard, the layout and the form all ask this,
 * because three copies of "read `state.from`" is how a login ends up navigating
 * to two different places at once — the guard winning the race, the form's
 * `navigate()` landing on an unmounted component, and the visitor left looking
 * at the form they just filled in.
 *
 * Anything that is not an internal path is discarded, and so is any `/auth/*`
 * path: a `from` of `/auth/login` means "you were already here", and navigating
 * to the page you are on is indistinguishable from not navigating at all.
 */
export function postLoginDestination(state: unknown): string {
  const fallback = "/workspaces";

  if (!state || typeof state !== "object") return fallback;

  const { from } = state as RedirectState;
  const pathname = from?.pathname;

  if (!pathname || !pathname.startsWith("/") || pathname.startsWith("//")) {
    return fallback;
  }

  if (pathname === "/auth" || pathname.startsWith("/auth/")) return fallback;

  return `${pathname}${from?.search ?? ""}${from?.hash ?? ""}`;
}
