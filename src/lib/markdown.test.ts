import { describe, expect, it } from "vitest";
import { applyInlineStyles, parseMarkdown, splitSlides } from "./markdown";

describe("splitSlides", () => {
  it("splits on --- outside code fences", () => {
    const md = [
      "# A",
      "---",
      "# B",
      "```js",
      "// this should NOT split:",
      "---",
      "console.log('x')",
      "```",
      "---",
      "# C",
    ].join("\n");

    const slides = splitSlides(md);
    expect(slides).toHaveLength(3);
    expect(slides[0]).toContain("# A");
    expect(slides[1]).toContain("# B");
    expect(slides[1]).toContain("console.log");
    expect(slides[2]).toContain("# C");
  });
});

describe("applyInlineStyles", () => {
  it("applies safe inline styles and strips unsafe patterns", () => {
    const ok = applyInlineStyles("[hi]{color:red; font-size:20px}");
    expect(ok).toContain("<span");
    expect(ok).toContain("color:red");

    const bad = applyInlineStyles("[x]{background-image:url(javascript:1)}");
    expect(bad).toBe("x");
  });
});

describe("parseMarkdown", () => {
  it("wraps fenced code blocks with copy button", () => {
    const html = parseMarkdown("```ts\nconst a = 1\n```\n");
    expect(html).toContain("copy-btn");
    expect(html).toContain("language-ts");
  });
});
