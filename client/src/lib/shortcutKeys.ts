/**
 * Shortcut keys, written the way the reader's keyboard is labelled.
 *
 * A tooltip that says "⌘K" on a Windows machine is wrong twice: the key does not exist and
 * the modifier does not work. Call sites write `"mod"` and this decides.
 */
const isMacLike = (): boolean =>
  typeof navigator !== "undefined" &&
  /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);

const MAC_LABEL: Record<string, string> = {
  mod: "⌘",
  shift: "⇧",
  alt: "⌥",
  ctrl: "⌃",
  enter: "↩",
  esc: "⎋",
  backspace: "⌫",
  tab: "⇥",
};

const OTHER_LABEL: Record<string, string> = {
  mod: "Ctrl",
  shift: "Shift",
  alt: "Alt",
  ctrl: "Ctrl",
  enter: "Enter",
  esc: "Esc",
  backspace: "Backspace",
  tab: "Tab",
};

/**
 * `["mod", "shift", "j"]` → `["⌘", "⇧", "J"]` on a Mac, `["Ctrl", "Shift", "J"]` elsewhere.
 * Anything not in the table is passed through with its first letter upper-cased.
 */
export function shortcutKeys(
  keys: string[],
  mac: boolean = isMacLike(),
): string[] {
  const table = mac ? MAC_LABEL : OTHER_LABEL;

  return keys.map((key) => {
    const lower = key.toLowerCase();
    const label = table[lower];
    if (label !== undefined) return label;

    return key.length === 1 ? key.toUpperCase() : key;
  });
}
