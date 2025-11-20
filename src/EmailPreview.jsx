import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";

export default function EmailPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const html = location.state?.html || "";
  const boxRef = useRef();

  const saveAsPdf = () => {
    const opt = {
      margin: 10,
      filename: "email-template.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(boxRef.current).save();
  };

  const showHtmlSource = () => {
    const w = window.open("", "_blank");
    w.document.write(`<pre>${escapeHtml(html)}</pre>`);
  };

  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate(-1)}>&larr; Back</button>
      <h2>Email Preview</h2>

      <div
        id="emailPreviewBox"
        ref={boxRef}
        style={{
          border: "1px solid #ddd",
          padding: 20,
          minHeight: 300,
          background: "#fff",
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div style={{ marginTop: 12 }}>
        <button onClick={showHtmlSource} style={{ marginRight: 8 }}>
          View HTML Source
        </button>
        <button onClick={saveAsPdf} style={{ marginRight: 8 }}>
          Save as PDF
        </button>
      </div>
    </div>
  );
}
