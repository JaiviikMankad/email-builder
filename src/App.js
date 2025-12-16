import { useState } from "react";
import EmailEditor from "./EmailEditor";
import EmailPreview from "./EmailPreview";

function App() {
  const [mode, setMode] = useState("editor");
  const [html, setHtml] = useState("");

  return (
    <div>
      {mode === "editor" && (
        <EmailEditor
          onPreview={(content) => {
            setHtml(content);
            setMode("preview");
          }}
        />
      )}

      {mode === "preview" && (
        <EmailPreview
          html={html}
          onBack={() => setMode("editor")}
          onSendEmail={() => alert("Next step: Email API will be done")}
        />
      )}
    </div>
  );
}

export default App;
