import React from "react";

/**
 * This uses HTML5 drag & drop.
 * Blocks contain HTML snippets to insert into editor when dropped.
 *
 * The EmailEditor listens for the 'drop' event on the editor container
 * and will read the 'text/html' payload and insert it.
 */

const blocks = [
  {
    id: "title",
    label: "Title",
    html: `<h1 style="font-family: Arial, Helvetica, sans-serif; text-align:center;">Your Email Title</h1>`
  },
  {
    id: "paragraph",
    label: "Text",
    html: `<p style="font-family: Arial, Helvetica, sans-serif; font-size:14px; line-height:1.5;">Start writing your content here...</p>`
  },
  {
    id: "image",
    label: "Image (sample)",
    // using your uploaded image path as sample image
    html: `<div style="text-align:center;"><img src="/mnt/data/bfc16495-89b6-4587-b95d-fba9dd8e0c47.png" alt="Sample" style="max-width:240px;" /></div>`
  },
  {
    id: "button",
    label: "Button",
    html: `<div style="text-align:center;"><a href="#" style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;border-radius:4px;text-decoration:none;">Call to action</a></div>`
  },
  {
    id: "divider",
    label: "Divider",
    html: `<hr style="border:none;border-top:1px solid #eee;margin:18px 0;" />`
  },
  {
    id: "table",
    label: "Table",
    html: `<table style="width:100%;border-collapse:collapse;"><thead><tr><th style="border:1px solid #ccc;padding:8px;">Header 1</th><th style="border:1px solid #ccc;padding:8px;">Header 2</th></tr></thead><tbody><tr><td style="border:1px solid #ccc;padding:8px;">Row 1</td><td style="border:1px solid #ccc;padding:8px;">Row 1</td></tr></tbody></table>`
  }
];

export default function Sidebar() {
  const onDragStart = (e, html) => {
    // add an HTML payload and plain text payload
    e.dataTransfer.setData("text/html", html);
    e.dataTransfer.setData("text/plain", html.replace(/<[^>]+>/g, ""));
  };

  return (
    <div style={{ border: "1px solid #eaeaea", padding: 12, borderRadius: 6 }}>
      <h3 style={{ marginTop: 0 }}>Blocks</h3>
      <div style={{ display: "grid", gap: 8 }}>
        {blocks.map(b => (
          <div
            key={b.id}
            draggable
            onDragStart={(e) => onDragStart(e, b.html)}
            style={{
              padding: 10,
              border: "1px dashed #ccc",
              borderRadius: 6,
              background: "#fafafa",
              cursor: "grab"
            }}
          >
            {b.label}
          </div>
        ))}
      </div>
    </div>
  );
}
