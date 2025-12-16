import React, { useRef, useState } from "react";
import { Editor, EditorTools } from "@progress/kendo-react-editor";
import { useNavigate } from "react-router-dom";

const { Bold, Italic, Underline, Undo, Redo } = EditorTools;

export default function EmailBuilder() {
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const [html, setHtml] = useState("");

  // Insert logo (fixed)
  const insertLogo = () => {
    const ed = editorRef.current;
    if (!ed) return;

    ed.exec("insertImage", {
      src: "/mnt/data/bfc16495-89b6-4587-b95d-fba9dd8e0c47.png",
      width: "200",
    });

    setTimeout(() => ed.exec("justifyCenter"), 100);
  };

  // Go to preview page
  const goToPreview = () => {
    navigate("/preview", { state: { html } });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Email Builder</h2>

      <div style={{ marginBottom: 10 }}>
        <button onClick={insertLogo}>Insert Logo</button>
        <button onClick={goToPreview}>Preview</button>
      </div>

      <Editor
        ref={editorRef}
        tools={[
          [Undo, Redo],
          [Bold, Italic, Underline],
        ]}
        contentStyle={{ height: 400, background: "#fff" }}
        onChange={(e) => setHtml(e.html)}
      />
    </div>
  );
}
