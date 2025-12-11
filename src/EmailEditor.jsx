import React, { useState } from "react";
import { Editor, EditorTools } from "@progress/kendo-react-editor";

const {
  Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  InsertImage, InsertTable,
  Undo, Redo
} = EditorTools;

export default function EmailEditor({ onPreview }) {
  const [html, setHtml] = useState("");

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const url = evt.target.result;

      // Center the logo automatically
      const logoHtml = `
        <div style="text-align:center; margin-bottom: 20px;">
          <img src="${url}" style="max-width:180px;" />
        </div>
      `;

      setHtml(logoHtml + html);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Upload Logo */}
      <input type="file" accept="image/*" onChange={handleLogoUpload} />

      <br /><br />

      {/* Kendo Editor */}
      <Editor
        value={html}
        onChange={(e) => setHtml(e.html)}
        tools={[
          [Bold, Italic, Underline],
          [AlignLeft, AlignCenter, AlignRight, AlignJustify],
          [InsertImage, InsertTable],
          [Undo, Redo],
        ]}
        style={{ height: 400 }}
      />

      <button
        style={{ marginTop: "20px", padding: "10px 20px" }}
        onClick={() => onPreview(html)}
      >
        Preview Template
      </button>
    </div>
  );
}
