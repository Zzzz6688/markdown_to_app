# MD-Slide Studio

一个面向「快速写/改面试 PPT」的 Markdown 幻灯片工具：左侧编辑，右侧实时渲染（用 `---` 分页），支持全屏演示、同步滚动、代码高亮/复制、主题切换与导出 PDF。

## 在线体验

- Demo: https://markdown-to-app-i7f9.vercel.app/

## 功能特性

- **Markdown → Slides**：使用 `---` 分割幻灯片（解析时会避开代码块里的 `---`）
- **实时预览**：输入后 300ms 防抖渲染，并对单页 HTML 做缓存（减少重复解析）
- **编辑器/预览双向同步滚动**：基于滚动比例 + 分页锚点对齐
- **全屏演示**：左右方向键 / 空格翻页，ESC 退出
- **代码体验**：Prism 高亮 + 行号容器 + 一键复制
- **主题切换**：内置多套演示主题（暗色/柔和/玻璃/复古/Monokai…）
- **导出 PDF**：拼装打印页并调用浏览器打印（适合快速导出）

## 技术栈

- React 18 + TypeScript
- Vite 5
- Markdown 渲染：marked
- 代码高亮：PrismJS
- 样式：CSS + Less

## 快速开始

```bash
npm install
npm run dev
```

常用命令：

```bash
npm run typecheck   # TS 类型检查
npm run lint        # ESLint
npm run format      # Prettier
npm test            # Vitest（无头）
npm run build       # Vite build
```

## 部署（GitHub Pages）

项目已配置 `gh-pages`：

```bash
npm run deploy
```

> 注意：`package.json` 里已配置 `homepage`，用于生成正确的静态资源路径。

## Markdown 内联样式语法

支持用简短语法为一段文字加样式：

```md
这是普通文字。[高亮文本]{color:blue; background-color:yellow; font-size:20px}
```

为了安全性，样式字符串会做简单清洗（例如移除 `url()` / `expression()` 等可疑内容）。

## 目录结构（核心）

- `src/lib/markdown.ts`：分页解析、内联样式、Markdown 渲染、代码块包装
- `src/hooks/useSlides.ts`：防抖渲染 + HTML 缓存
- `src/hooks/useAppLogic.ts`：同步滚动、全屏演示、跳转、导出 PDF
- `src/components/*`：编辑区/预览区/全屏舞台/顶部控制栏

## 亮点实现（面试可讲）

- **分页解析可靠性**：`splitSlides()` 会跟踪代码围栏（```/~~~），避免把代码块里的 `---` 误当分页
- **渲染性能**：输入防抖 + 单页 HTML 缓存，降低 marked/Prism 重算频率
- **同步滚动体验**：既支持按比例同步，也支持“分隔线落入视口时”做 slide 顶部对齐

## License

MIT
