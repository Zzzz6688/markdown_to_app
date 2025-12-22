import React, { useEffect } from "react";
import "./FullscreenStage.less";

export default function FullscreenStage(props: {
  currentIndex: number;
  slides: string[];
  getSlideHtml: (s: string) => string;
  selectedTheme: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { currentIndex, slides, getSlideHtml, selectedTheme, onPrev, onNext } =
    props;

  // Copy button in fullscreen
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

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return (
    <div className="fs-stage">
      <button className="fs-btn prev" onClick={onPrev}>
        ←
      </button>
      <div className="fs-slide-container">
        <div
          className={`fs-slide ${selectedTheme}`}
          dangerouslySetInnerHTML={{
            __html: getSlideHtml(slides[currentIndex] || ""),
          }}
        />
      </div>
      <button className="fs-btn next" onClick={onNext}>
        →
      </button>
    </div>
  );
}
