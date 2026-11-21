import { describe, expect, it } from "vitest";

import { isSafeLinkUrl } from "./safeUrl";

/**
 * The link guard for attachment rows.
 *
 * Every `true` here is a URL a browser will not execute; every `false` is one
 * that would. The server refuses to store the dangerous ones now — these cases
 * are about the rows that were stored before it did.
 */

describe("isSafeLinkUrl", () => {
  it("accepts https", () => {
    expect(isSafeLinkUrl("https://ik.imagekit.io/demo/spec.pdf")).toBe(true);
  });

  it("accepts http, so an old row stays openable", () => {
    expect(isSafeLinkUrl("http://example.com/file.pdf")).toBe(true);
  });

  it("rejects javascript:, in any casing", () => {
    expect(isSafeLinkUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeLinkUrl("JavaScript:alert(1)")).toBe(false);
  });

  it("rejects a data: document", () => {
    expect(
      isSafeLinkUrl(
        "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
      ),
    ).toBe(false);
  });

  it("rejects file: and vbscript:", () => {
    expect(isSafeLinkUrl("file:///etc/passwd")).toBe(false);
    expect(isSafeLinkUrl("vbscript:msgbox(1)")).toBe(false);
  });

  it("rejects anything that is not a URL", () => {
    expect(isSafeLinkUrl("not a url")).toBe(false);
    expect(isSafeLinkUrl("")).toBe(false);
    expect(isSafeLinkUrl("/relative/path.pdf")).toBe(false);
  });
});
