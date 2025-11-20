import React, { useRef } from "react";
import { savePDF } from "@progress/kendo-react-pdf";

export default function EmailPreview({ html, onBack, onSendEmail }) {
  const previewRef = useRef();

  const handleDownloadPDF = () => {
    savePDF(previewRef.current, {
      paperSize: "A4",
      margin: 20,
    });
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>

      <button onClick={onBack} style={{ marginBottom: "20px" }}>
        ⬅ Back to Editor
      </button>

      <h2>Email Template Preview</h2>

     <div
  ref={previewRef}
  style={{
    border: "1px solid #ccc",
    padding: "20px",
    backgroundColor: "white",
    marginTop: "20px",
  }}
>
  <style>
    {`
      table {
        width: 100%;
        border-collapse: collapse;
      }

      table, th, td {
        border: 1px solid #000;
      }

      th, td {
        padding: 8px;
      }
    `}
  </style>

  <div dangerouslySetInnerHTML={{ __html: html }} />
</div>

    </div>
  );
}
