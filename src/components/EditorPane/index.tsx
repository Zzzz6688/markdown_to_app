import React from "react";
import "./EditorPane.less";

export default function EditorPane(props: {
  md: string;
  setMd: (v: string) => void;
  editorRef: React.RefObject<HTMLTextAreaElement>;
}) {
  return (
    <section className="editor-pane">
      <textarea
        ref={props.editorRef}
        value={props.md}
        onChange={(e) => props.setMd(e.target.value)}
        aria-label="Markdown 编辑器"
      />
    </section>
  );
}
