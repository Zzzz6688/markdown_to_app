import React from "react";
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
