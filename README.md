# MD-Slide Studio

一个小而美的 React + TypeScript 原型，将 Markdown（用 `---` 分割）实时渲染为幻灯片并支持全屏演示与同步滚动。

运行：

```bash
npm install
npm run dev
```

特色：

- 左侧 Markdown 编辑器，右侧实时预览（按 `---` 分页）
- 编辑器与预览区同步滚动
- 全屏演示（支持左右翻页、ESC 退出）

可定制样式（内联）示例：

在 Markdown 中可使用简短语法为某段文字设置 CSS 样式：

```md
这是普通文字。[高亮文本]{color:blue; background-color:yellow}
```

支持的属性示例：`color`、`background-color`、`font-size`、`font-family` 等（请使用标准 CSS 格式，多个属性以分号分隔）。

注意：为了安全性，样式字符串会被简单清洗以移除可疑内容（如 `url()` 或 `expression()`），请只输入常规样式。
