import React from "react";
import Header from "./components/Header";
import EditorPane from "./components/EditorPane";
import PreviewPane from "./components/PreviewPane";
import FullscreenStage from "./components/FullscreenStage";
import { useAppLogic } from "./hooks/useAppLogic";

const DEFAULT_MD = `# MD-Slide Studio

左侧输入 Markdown，使用三个连续横线分割幻灯片：

---

## Slide 1

- 支持实时预览
- 支持同步滚动
- 支持代码高亮

---

## Slide 2

演示全屏模式，使用键盘左右箭头翻页。

---

## Slide 3

你可以把它当作写面试 PPT 的快速工具。

`;

// markdown utilities live in src/lib/markdown and parsing is handled by the hook

export default function App() {
  const api = useAppLogic(DEFAULT_MD);
  // all app logic (refs, effects, helpers) lives in `useAppLogic`

  return (
    <div className="app-root">
      <Header
        themes={api.themes}
        selectedTheme={api.selectedTheme}
        setSelectedTheme={api.setSelectedTheme}
        isFullscreen={api.isFullscreen}
        onToggleFullscreen={() => {
          if (api.isFullscreen) {
            document.exitFullscreen().catch(() => {});
            api.setIsFullscreen(false);
          } else {
            api.enterFullscreen();
          }
        }}
        onExportPdf={() => api.exportPdf()}
      />

      <main className="app-main">
        <EditorPane md={api.md} setMd={api.setMd} editorRef={api.editorRef} />

        {!api.isFullscreen ? (
          <PreviewPane
            slides={api.slides}
            getSlideHtml={api.getSlideHtml}
            selectedTheme={api.selectedTheme}
            jumpToSlide={api.jumpToSlide}
            previewRef={api.previewRef}
          />
        ) : (
          <section className="preview-pane">
            <FullscreenStage
              currentIndex={api.currentIndex}
              slides={api.slides}
              getSlideHtml={api.getSlideHtml}
              selectedTheme={api.selectedTheme}
              onPrev={() => api.setCurrentIndex((i) => Math.max(i - 1, 0))}
              onNext={() =>
                api.setCurrentIndex((i) =>
                  Math.min(i + 1, api.slides.length - 1)
                )
              }
            />
          </section>
        )}
      </main>

      <footer className="app-footer">
        <div>
          幻灯片数: {api.slides.length} • 当前:{" "}
          {api.isFullscreen ? api.currentIndex + 1 : "-"}{" "}
        </div>
      </footer>
    </div>
  );
}
