import React from "react";
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
