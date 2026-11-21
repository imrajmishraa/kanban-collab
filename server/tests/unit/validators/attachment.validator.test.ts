import { describe, expect, it } from "vitest";

import { addAttachmentSchema } from "../../../src/interfaces/http/validators/kanban/attachment.validator";

/**
 * The attachment body, and the one field that used to be a script sink.
 *
 * `url` reached `CardAttachments.tsx` as an `href`, and `z.string().url()`
 * accepted every scheme — so `javascript:alert(1)` was a stored link that ran
 * in each member's session. These cases pin the scheme rule.
 */

const valid = {
  url: "https://ik.imagekit.io/demo/board/spec.pdf",
  name: "spec.pdf",
  fileType: "application/pdf",
  size: 1024,
};

const parse = (url: string) =>
  addAttachmentSchema.body.safeParse({ ...valid, url });

describe("addAttachmentSchema url", () => {
  it("accepts an https URL", () => {
    expect(parse(valid.url).success).toBe(true);
  });

  it("trims surrounding whitespace before judging it", () => {
    expect(parse(`  ${valid.url}  `).success).toBe(true);
  });

  it("rejects javascript:", () => {
    /* The regression test: this parsed successfully before the fix. */
    expect(parse("javascript:alert(document.cookie)").success).toBe(false);
  });

  it("rejects a data: document", () => {
    expect(
      parse("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==")
        .success,
    ).toBe(false);
  });

  it("rejects file:", () => {
    expect(parse("file:///etc/passwd").success).toBe(false);
  });

  it("rejects plain http, which could be swapped in transit", () => {
    expect(parse("http://example.com/spec.pdf").success).toBe(false);
  });

  it("rejects something that is not a URL at all", () => {
    expect(parse("not a url").success).toBe(false);
  });
});

describe("addAttachmentSchema body", () => {
  it("still requires a name and a file type", () => {
    const withoutName = addAttachmentSchema.body.safeParse({
      ...valid,
      name: "   ",
    });

    expect(withoutName.success).toBe(false);
  });

  it("accepts an omitted size", () => {
    const { size: _size, ...rest } = valid;

    expect(addAttachmentSchema.body.safeParse(rest).success).toBe(true);
  });
});
