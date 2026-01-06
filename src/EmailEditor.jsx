import React, { useState } from "react";
import { Editor, EditorTools } from "@progress/kendo-react-editor";
import imageCompression from "browser-image-compression";

const {
  Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  InsertTable, InsertImage,
  Undo, Redo
} = EditorTools;

export default function EmailEditor({ onPreview }) {
  const [html, setHtml] = useState("");

  // LOGO uploader (small + centered)
  const handleLogoInsert = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const compressedFile = await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 300,
      useWebWorker: true,
      initialQuality: 0.9
    });

    const reader = new FileReader();
    reader.onload = (evt) => {
      const url = evt.target.result;

      // Email-safe logo HTML
      const logoHtml = `
    <div style="text-align:center; padding:20px 0;">
  <img
    src="${url}"
    alt="Logo"
    width="140"
    style="
      display:inline-block;
      max-width:140px;
      height:auto;
      border:0;
      outline:none;
      box-shadow:none;
      text-decoration:none;
    "
  />
</div>



      `;

      setHtml(prev => logoHtml + prev); // logo always on top
    };

    reader.readAsDataURL(compressedFile);
  };

const DEFAULT_REDIRECT_URL = "https://www.ozcoastlogistics.com.au/contact-us/";

const handleImageInsert = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const compressedFile = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    initialQuality: 0.9,
  });

  const reader = new FileReader();
  reader.onload = (evt) => {
    const url = evt.target.result;

    const imageHtml = `
      <div style="text-align:center; margin:20px 0;">
        <a
          href="${DEFAULT_REDIRECT_URL}"
          target="_blank"
          style="text-decoration:none; border:0;"
        >
          <img
            src="${url}"
            alt="Image"
            style="
              max-width:100%;
              height:auto;
              display:block;
              margin:0 auto;
              border:0;
              outline:none;
              text-decoration:none;
            "
          />
        </a>
      </div>
    `;

    setHtml((prev) => prev + imageHtml);
  };

  reader.readAsDataURL(compressedFile);
};

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>

      {/* Logo Upload */}
      <div style={{ marginBottom: 10 }}>
        <label><b>Upload Logo:</b></label><br />
        <input type="file" accept="image/*" onChange={handleLogoInsert} />
      </div>

      {/* Content Image Upload */}
      <div style={{ marginBottom: 10 }}>
        <label><b>Insert Image:</b></label><br />
        <input type="file" accept="image/*" onChange={handleImageInsert} />
      </div>

      {/* Editor */}
      <Editor
        value={html}
        onChange={e => setHtml(e.html)}
        tools={[
          [Bold, Italic, Underline],
          [AlignLeft, AlignCenter, AlignRight, AlignJustify],
          [InsertTable, InsertImage],
          [Undo, Redo]
        ]}
        style={{ height: 400 }}
      />

      <button
        style={{ marginTop: 20, padding: "10px 20px" }}
        onClick={() => onPreview(html)}
      >
        Preview Template
      </button>
    </div>
  );
}

