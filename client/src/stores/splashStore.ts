export type SplashPhase = "boot" | "auth";

interface Holder {
  token: symbol;
  phase: SplashPhase;
}

let holders: Holder[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function pushSplash(token: symbol, phase: SplashPhase) {
  holders = [
    ...holders.filter((holder) => holder.token !== token),
    { token, phase },
  ];
  emit();
}

export function removeSplash(token: symbol) {
  const next = holders.filter((holder) => holder.token !== token);
  if (next.length === holders.length) return;

  holders = next;
  emit();
}

/** Primitive, so `useSyncExternalStore` can compare it by value. */
export function getSplashPhase(): SplashPhase | null {
  const last = holders[holders.length - 1];
  return last ? last.phase : null;
}

export function subscribeSplash(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
