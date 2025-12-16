import React, { useState } from "react";
import { Editor, EditorTools } from "@progress/kendo-react-editor";
import imageCompression from "browser-image-compression";

const {
  Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  InsertTable,InsertImage,
  Undo, Redo
} = EditorTools;

export default function EmailEditor({ onPreview }) {
  const [html, setHtml] = useState("");

  // Generic image uploader (logo or any image)
  const handleImageInsert = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const compressedFile = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      initialQuality: 0.9
    });

    const reader = new FileReader();
    reader.onload = (evt) => {
      const url = evt.target.result;
      const imageHtml = `
        <div style="text-align:center; margin-bottom: 20px;">
          <img src="${url}" style="max-width:100%;" />
        </div>
      `;
      setHtml(prev => prev + imageHtml); // append to current content
    };
    reader.readAsDataURL(compressedFile);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Logo upload */}
      <div style={{ marginBottom: 10 }}>
        <label><b>Choose File (Logo):</b></label>
        <input type="file" accept="image/*" onChange={handleImageInsert} />
      </div>

      {/* Another image input if needed */}
      <div style={{ marginBottom: 10 }}>
        <label><b>Insert Image:</b></label>
        <input type="file" accept="image/*" onChange={handleImageInsert} />
      </div>

      {/* Kendo Editor */}
      <Editor
        value={html}
        onChange={e => setHtml(e.html)}
        tools={[
          [Bold, Italic, Underline],
          [AlignLeft, AlignCenter, AlignRight, AlignJustify],
          [InsertTable],[InsertImage],
          [Undo, Redo]
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
