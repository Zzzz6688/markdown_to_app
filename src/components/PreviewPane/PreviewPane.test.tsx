import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import PreviewPane from "./index";
import { parseMarkdown } from "@/lib/markdown";

describe("PreviewPane", () => {
  it("copies code when clicking the copy button", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    const slide = "```js\nconsole.log('hi')\n```";
    const slides = [slide];

    const previewRef = { current: null } as React.RefObject<HTMLDivElement>;

    const { container } = render(
      <PreviewPane
        slides={slides}
        getSlideHtml={(s) => parseMarkdown(s)}
        selectedTheme="theme-default"
        jumpToSlide={() => {}}
        previewRef={previewRef}
      />
    );

    const btn = container.querySelector(
      ".copy-btn"
    ) as HTMLButtonElement | null;
    expect(btn).not.toBeNull();

    fireEvent.click(btn!);

    expect(writeText).toHaveBeenCalled();
  });
});
