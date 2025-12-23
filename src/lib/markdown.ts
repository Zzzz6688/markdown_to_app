import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";

// Preserve single newlines as <br>
marked.setOptions({
  breaks: true,
  // Avoid deprecated defaults (and keeps output deterministic)
  mangle: false,
  headerIds: false,
});

marked.use(
  markedHighlight({
    langPrefix: "language-",
    highlight(code, lang) {
      const language = lang && Prism.languages[lang] ? lang : "javascript";
      return Prism.highlight(code, Prism.languages[language], language);
    },
  })
);

export function splitSlides(md: string) {
  const lines = md.split(/\r?\n/);
  const slides: string[] = [];
  const buffer: string[] = [];
  let inFence = false;
  let fenceMarker = ""; // remember ``` or ~~~ style fences

  for (const line of lines) {
    const fenceMatch = line.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (line.startsWith(fenceMarker)) {
        inFence = false;
        fenceMarker = "";
      }
    }

    if (!inFence && /^---\s*$/.test(line)) {
      slides.push(buffer.join("\n").trim());
      buffer.length = 0;
      continue;
    }

    buffer.push(line);
  }

  slides.push(buffer.join("\n").trim());
  return slides;
}

// 将单反引号包裹的多行内容提升为代码块
function expandBacktickBlocks(md: string) {
  // 只处理孤立的单反引号（排除 ``` 等连续反引号）
  const re = /(?<!`)`([\s\S]*?)`(?!`)/g;
  return md.replace(re, (m, inner) => {
    if (!inner.includes("\n")) return m; // 保留单行内联代码
    return "```\n" + inner + "\n```";
  });
}

function sanitizeStyle(style: string) {
  const allowed = style.replace(/[^a-zA-Z0-9#().,%:\-;\s]/g, "");
  if (/url\s*\(|expression\s*\(/i.test(allowed)) return "";
  return allowed;
}

export function applyInlineStyles(md: string) {
  return md.replace(/\[([^\]]+)\]\{([^}]+)\}/g, (_m, text, style) => {
    const safe = sanitizeStyle(style);
    if (!safe) return text;
    return `<span style="${safe}">${text}</span>`;
  });
}

// 仅解析，不再自动包代码围栏；需要代码块请手动输入 ```
export function parseMarkdown(md: string) {
  const expanded = expandBacktickBlocks(md);
  const html = marked.parse(applyInlineStyles(expanded));
  // 给代码块加行号容器
  return html.replace(
    /<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g,
    (_m, attrs, codeHtml) => {
      const langMatch = attrs.match(/language-([^"\s>]+)/);
      const lang = langMatch ? langMatch[1] : "text";
      const lines = codeHtml
        .split("\n")
        .map((l: string) => `<span class="code-line">${l}</span>`)
        .join("");
      return `
<div class="code-wrapper">
  <button class="copy-btn" type="button">复制</button>
  <pre class="code-block"><code class="language-${lang}">${lines}</code></pre>
</div>`;
    }
  );
}
