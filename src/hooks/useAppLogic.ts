import { useEffect, useRef, useState } from "react";
import { splitSlides } from "../lib/markdown";
import { useSlides } from "./useSlides";

export function useAppLogic(defaultMd: string) {
  const [md, setMd] = useState<string>(defaultMd);
  const { slides, getSlideHtml } = useSlides(md, 300);

  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const syncingEditor = useRef(false);
  const syncingPreview = useRef(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const themes = [
    { id: "theme-default", label: "Default" },
    { id: "theme-dark", label: "暗色" },
    { id: "theme-pastel", label: "柔和" },
    { id: "theme-modern", label: "现代" },
    { id: "theme-elegant", label: "优雅" },
    { id: "theme-glass", label: "玻璃" },
    { id: "theme-retro", label: "复古" },
    { id: "theme-monokai", label: "Monokai（代码风）" },
    { id: "theme-serif", label: "杂志风" },
    { id: "theme-neon", label: "霓虹" },
  ];
  const [selectedTheme, setSelectedTheme] = useState<string>(themes[0].id);

  function exportPdf() {
    const printHtml = slides
      .map(
        (s) =>
          `<section class="slide ${selectedTheme}"><div class="slide-inner">${getSlideHtml(
            s
          )}</div></section>`
      )
      .join("\n");

    const styles = Array.from(
      document.querySelectorAll("style, link[rel='stylesheet']")
    )
      .map((node) => (node as HTMLElement).outerHTML)
      .join("\n");

    const win = window.open("", "_blank", "width=1400,height=900");
    if (!win) return;

    win.document.write(`<!doctype html>
<html>
<head>
${styles}
<style>
@page { size: A4; margin: 12mm; }

/* Print-friendly defaults */
html, body { background: #fff; }
body.print-body {
  margin: 0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* One slide per page, stable pagination */
@media print {
  body.print-body { counter-reset: slide; }
  .slide {
    counter-increment: slide;
    break-after: page;
    page-break-after: always;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .slide:last-child {
    break-after: auto;
    page-break-after: auto;
  }

  /* Page number (bottom-right) */
  .slide::after {
    content: counter(slide);
    position: absolute;
    right: 10mm;
    bottom: 8mm;
    font-size: 10pt;
    color: rgba(15, 23, 42, 0.55);
  }
}

/* A4 document-like layout */
.print-body .slide {
  box-shadow: none;
  border-radius: 0;
  margin: 0 auto 12mm;
  width: 190mm;
  max-width: 190mm;
  min-height: 267mm;
  padding: 0;
  position: relative;
}

.print-body .slide-inner {
  box-sizing: border-box;
  width: 100%;
  min-height: 267mm;
  padding: 12mm;
}

/* Remove UI-only controls in print */
@media print {
  .copy-btn { display: none !important; }
}

/* Code blocks: wrap & avoid clipping in print */
@media print {
  pre {
    overflow: visible !important;
    white-space: pre-wrap;
    word-break: break-word;
  }
  pre, code {
    font-size: 10pt;
    line-height: 1.4;
  }
}
</style>
</head>
<body class="print-body">
${printHtml}
</body>
</html>`);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 300);
  }

  // 双向同步滚动（基于比例，若分隔线在视口内则对齐对应 slide）
  useEffect(() => {
    let rafId: number | null = null;

    // compute pixel Y positions (relative to editor content) for each slide start
    function computeSlideStartYs() {
      const ed = editorRef.current;
      if (!ed) return [] as number[];
      const parts = splitSlides(md);
      const ys: number[] = [];
      let searchIndex = 0;
      const text = md || "";
      const cs = window.getComputedStyle(ed);
      let lineHeight = parseFloat(cs.lineHeight || "");
      if (!lineHeight || isNaN(lineHeight)) lineHeight = 18;

      for (const p of parts) {
        const idx = text.indexOf(p, searchIndex);
        const prefix = text.slice(0, idx);
        const lineNum = prefix.split("\n").length - 1;
        ys.push(lineNum * lineHeight);
        searchIndex = idx + p.length;
      }
      return ys;
    }

    function onEditorScroll() {
      const ed = editorRef.current;
      const pv = previewRef.current;
      if (!ed || !pv) return;
      if (syncingEditor.current) return;

      // find first separator (slide start except first) visible in editor viewport
      const slideY = computeSlideStartYs();
      const viewportTop = ed.scrollTop;
      const viewportBottom = ed.scrollTop + ed.clientHeight;

      let targetIndex = -1;
      for (let i = 1; i < slideY.length; i++) {
        const y = slideY[i];
        if (y >= viewportTop && y <= viewportBottom) {
          targetIndex = i;
          break;
        }
      }

      if (targetIndex === -1) {
        syncingPreview.current = true;
        const ratio = ed.scrollTop / (ed.scrollHeight - ed.clientHeight || 1);
        const target = ratio * (pv.scrollHeight - pv.clientHeight);
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const pv2 = previewRef.current;
          if (pv2) pv2.scrollTop = target;
          syncingPreview.current = false;
        });
        return;
      }

      // align the corresponding slide top to the separator's viewport Y
      const sepViewportY = slideY[targetIndex] - ed.scrollTop;
      const slidesEls = Array.from(
        pv.querySelectorAll(".slide")
      ) as HTMLElement[];
      const el = slidesEls[targetIndex];
      if (!el) return;
      const desiredScrollTop = el.offsetTop - sepViewportY;
      syncingPreview.current = true;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const pv2 = previewRef.current;
        if (pv2) pv2.scrollTop = Math.max(0, desiredScrollTop);
        syncingPreview.current = false;
      });
    }

    function onPreviewScroll() {
      const ed = editorRef.current;
      const pv = previewRef.current;
      if (!ed || !pv) return;
      if (syncingPreview.current) return;
      syncingEditor.current = true;
      const ratio = pv.scrollTop / (pv.scrollHeight - pv.clientHeight || 1);
      const target = ratio * (ed.scrollHeight - ed.clientHeight);
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const ed2 = editorRef.current;
        if (ed2) ed2.scrollTop = target;
        syncingEditor.current = false;
      });
    }

    const ed = editorRef.current;
    const pv = previewRef.current;
    if (ed) ed.addEventListener("scroll", onEditorScroll);
    if (pv) pv.addEventListener("scroll", onPreviewScroll);

    return () => {
      if (ed) ed.removeEventListener("scroll", onEditorScroll);
      if (pv) pv.removeEventListener("scroll", onPreviewScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [slides, md]);

  // Fullscreen handlers and keyboard
  useEffect(() => {
    function onFullChange() {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
    }
    document.addEventListener("fullscreenchange", onFullChange);
    return () => document.removeEventListener("fullscreenchange", onFullChange);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!isFullscreen) return;
      if (e.key === "ArrowRight" || e.key === " ") {
        setCurrentIndex((i) => Math.min(i + 1, slides.length - 1));
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((i) => Math.max(i - 1, 0));
        e.preventDefault();
      } else if (e.key === "Escape") {
        document.exitFullscreen().catch(() => {});
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen, slides.length]);

  function enterFullscreen() {
    const elem = document.documentElement;
    elem.requestFullscreen().catch(() => {});
    setCurrentIndex(0);
  }

  function jumpToSlide(i: number) {
    const ed = editorRef.current;
    if (!ed) return;
    let offset = 0;
    const arr = splitSlides(md);
    for (let k = 0; k < i; k++) offset += arr[k].length + 4;
    ed.focus();
    ed.selectionStart = Math.min(offset, ed.value.length);
    ed.selectionEnd = ed.selectionStart;
    const lineHeight = 18;
    ed.scrollTop = Math.max(0, Math.floor(offset / 80) * lineHeight);
    const pv = previewRef.current;
    if (pv) {
      const slidesEls = Array.from(
        pv.querySelectorAll(".slide")
      ) as HTMLElement[];
      const el = slidesEls[i];
      if (el) {
        syncingPreview.current = true;
        pv.scrollTop = el.offsetTop;
        requestAnimationFrame(() => {
          syncingPreview.current = false;
        });
      }
    }
  }

  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;

    function findSlideIndexFromCaret(): number {
      const pos = ed?.selectionStart ?? 0;
      const parts = splitSlides(md);
      let cum = 0;
      for (let i = 0; i < parts.length; i++) {
        const len = parts[i].length + 4; // separator approx
        if (pos <= cum + len) return i;
        cum += len;
      }
      return parts.length - 1;
    }

    function onCaretMove() {
      if (isFullscreen) return;
      const i = findSlideIndexFromCaret();
      const pv = previewRef.current;
      if (!pv) return;
      const slidesEls = Array.from(
        pv.querySelectorAll(".slide")
      ) as HTMLElement[];
      const el = slidesEls[i];
      if (el) {
        syncingPreview.current = true;
        pv.scrollTop = el.offsetTop;
        requestAnimationFrame(() => {
          syncingPreview.current = false;
        });
      }
    }

    ed.addEventListener("keyup", onCaretMove);
    ed.addEventListener("click", onCaretMove);

    return () => {
      ed.removeEventListener("keyup", onCaretMove);
      ed.removeEventListener("click", onCaretMove);
    };
  }, [md, isFullscreen]);

  return {
    md,
    setMd,
    slides,
    getSlideHtml,
    editorRef,
    previewRef,
    isFullscreen,
    setIsFullscreen,
    currentIndex,
    setCurrentIndex,
    themes,
    selectedTheme,
    setSelectedTheme,
    enterFullscreen,
    jumpToSlide,
    exportPdf,
  } as const;
}
