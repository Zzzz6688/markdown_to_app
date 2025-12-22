import React, { useEffect } from "react";
import "./PreviewPane.less";

export default function PreviewPane(props: {
  slides: string[];
  getSlideHtml: (s: string) => string;
  selectedTheme: string;
  jumpToSlide: (i: number) => void;
  previewRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { slides, getSlideHtml, selectedTheme, jumpToSlide, previewRef } =
    props;

  // Delegate copy button clicks to preview area (also works when HTML updates)
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest(".copy-btn") as HTMLButtonElement | null;
      if (!btn) return;
      const wrapper = btn.closest(".code-wrapper");
      const codeEl = wrapper?.querySelector("pre code");
      const lines = Array.from(
        wrapper?.querySelectorAll(".code-line") || []
      ).map((n) => (n as HTMLElement).textContent || "");
      const text = lines.length ? lines.join("\n") : codeEl?.textContent || "";
      const reset = (label: string) => {
        btn.textContent = label;
        setTimeout(() => {
          btn.textContent = "复制";
        }, 1500);
      };

      if (!text) {
        reset("无内容");
        return;
      }

      navigator.clipboard
        .writeText(text)
        .then(() => reset("已复制"))
        .catch(() => reset("复制失败"));
    }

    const container = previewRef.current;
    if (container) container.addEventListener("click", onClick);
    document.addEventListener("click", onClick);
    return () => {
      if (container) container.removeEventListener("click", onClick);
      document.removeEventListener("click", onClick);
    };
  }, [previewRef]);

  return (
    <section className="preview-pane">
      <div className="preview" ref={previewRef}>
        {slides.map((s, i) => (
          <div
            key={i}
            className={`slide ${selectedTheme}`}
            onClick={() => jumpToSlide(i)}
            dangerouslySetInnerHTML={{ __html: getSlideHtml(s) }}
          />
        ))}
      </div>
    </section>
  );
}
