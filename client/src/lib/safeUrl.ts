/**
 * Is this URL safe to render as a link?
 *
 * `href` is a script sink: `javascript:alert(1)` and `data:text/html,…` run in
 * this page's origin when the link is clicked. The server now refuses to store
 * anything but `https` for an attachment, but rows written before that rule
 * still hold whatever was sent — there is no backfill — so the client is the
 * only place that can neutralise them.
 *
 * `http` is allowed here even though the server refuses it: this guard is about
 * script execution, not transport, and an old row pointing at a plain-http file
 * should still be openable. The strict rule belongs at the write boundary.
 *
 * No base URL on purpose: an attachment URL is absolute, and a relative one has
 * no business being a link in this list.
 */
export function isSafeLinkUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}
