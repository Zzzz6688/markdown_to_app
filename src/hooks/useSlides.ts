import { useEffect, useRef, useState } from "react";
import { splitSlides, parseMarkdown } from "../lib/markdown";

export function useSlides(md: string, debounceMs = 300) {
  const [slides, setSlides] = useState<string[]>(() => splitSlides(md));
  const slideHtmlCache = useRef<Map<string, string>>(new Map());
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    debounceTimer.current = window.setTimeout(() => {
      const parts = splitSlides(md);
      setSlides(parts);

      const newCache = new Map<string, string>();
      for (const p of parts) {
        const key = p;
        const existing = slideHtmlCache.current.get(key);
        if (existing) newCache.set(key, existing);
        else {
          try {
            const html = parseMarkdown(p || "");
            newCache.set(key, html);
          } catch (e) {
            newCache.set(key, "");
          }
        }
      }
      slideHtmlCache.current = newCache;
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    };
  }, [md, debounceMs]);

  function getSlideHtml(s: string) {
    const key = s;
    const cached = slideHtmlCache.current.get(key);
    if (cached !== undefined) return cached;
    const html = parseMarkdown(s || "");
    slideHtmlCache.current.set(key, html);
    return html;
  }

  return { slides, getSlideHtml };
}
