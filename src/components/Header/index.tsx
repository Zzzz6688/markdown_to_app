import React from "react";
import "./Header.less";

type Theme = { id: string; label: string };

export default function Header(props: {
  themes: Theme[];
  selectedTheme: string;
  setSelectedTheme: (s: string) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onExportPdf: () => void;
}) {
  const {
    themes,
    selectedTheme,
    setSelectedTheme,
    isFullscreen,
    onToggleFullscreen,
    onExportPdf,
  } = props;
  return (
    <header className="app-header">
      <h1>MD-Slide Studio</h1>
      <div className="controls">
        <label style={{ marginRight: 8, color: "#cbd5e1" }}>主题</label>
        <select
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value)}
        >
          {themes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <button style={{ marginLeft: 12 }} onClick={onToggleFullscreen}>
          {isFullscreen ? "退出全屏演示" : "进入全屏演示"}
        </button>
        <button style={{ marginLeft: 8 }} onClick={onExportPdf}>
          导出 PDF
        </button>
      </div>
    </header>
  );
}
