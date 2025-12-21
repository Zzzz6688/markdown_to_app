import { marked } from "marked";

// Preserve single newlines as <br>
marked.setOptions({ breaks: true });

export function splitSlides(md: string) {
  return md.split(/^---$/m).map((s) => s.replace(/^\s+|\s+$/g, ""));
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

export function parseMarkdown(md: string) {
  return marked.parse(applyInlineStyles(md));
}
