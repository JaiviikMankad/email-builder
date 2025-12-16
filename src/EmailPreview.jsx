import React, { useRef } from "react";
import { savePDF } from "@progress/kendo-react-pdf";
import { sendEmail } from "../src/api/sendEmail";   // ✅ ADD THIS

export default function EmailPreview({ html, onBack }) {
  const previewRef = useRef();

  const handleDownloadPDF = () => {
    savePDF(previewRef.current, {
      paperSize: "A4",
      margin: 20,
    });
  };

 // inside EmailPreview.jsx (adapt)
const handleSendEmail = async () => {
  // ask user which connected account to send from (or let them enter)
  // fetch connected accounts
  const connected = await fetch(`${process.env.REACT_APP_BACKEND_ORIGIN || 'http://localhost:5000'}/connected`).then(r=>r.json());
  // if none connected, instruct user to connect first
  if (!connected || connected.length === 0) {
    alert('No Outlook account connected. Click Connect Outlook first.');
    return;
  }
  // choose first for demo, or show selection UI
  const fromEmail = connected[0].email || connected[0];

  const to = prompt('Recipient email (to):');
  const cc = prompt('CC (optional, leave blank if none):');
  const subject = prompt('Subject:', 'Test email from Email Builder');

  const res = await fetch(`${process.env.REACT_APP_BACKEND_ORIGIN || 'http://localhost:5000'}/send-mail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fromEmail,
      to,
      cc,
      subject,
      html, // your preview html
    })
  });

  const data = await res.json();
  if (res.ok && data.success) {
    alert('Email sent successfully');
  } else {
    alert('Send failed: ' + (data.error?.message || JSON.stringify(data)));
  }
};

const handleConnectOutlook = () => {
  // open OAuth page in popup
  const backend = process.env.REACT_APP_BACKEND_ORIGIN || "http://localhost:5000";
  const win = window.open(
    backend + "/auth/outlook",
    "_blank",
    "width=600,height=700"
  );

  // Listen for popup message after successful login
  window.addEventListener("message", (event) => {
    if (event.data?.type === "outlook_connected") {
      alert("Outlook connected: " + event.data.email);
    }
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

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button onClick={handleDownloadPDF}>Download PDF</button>
        <button onClick={handleConnectOutlook}>Connect Outlook</button>
        <button onClick={handleSendEmail}>Send Email</button>
      </div>
    </div>
  );
}
