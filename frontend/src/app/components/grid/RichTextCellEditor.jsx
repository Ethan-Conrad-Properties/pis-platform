"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// ✅ Use react-quill-new (React 19 compatible)
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function RichTextCellEditor({ value, onValueChange }) {
  const [editorValue, setEditorValue] = useState(value || "");

  useEffect(() => {
    if (onValueChange) onValueChange(editorValue);
  }, [editorValue]);

  return (
    <div style={{ width: 220, minHeight: 120, background: "white" }}>
      <ReactQuill
        value={editorValue}
        onChange={setEditorValue}
        theme="snow"
        formats={["bold", "italic", "underline", "color", "background"]}
        modules={{
          toolbar: [
            ["bold", "italic", "underline"],
            [{ color: [] }, { background: [] }],
            ["clean"],
          ],
        }}
        style={{ minHeight: "auto" }}
      />
    </div>
  );
}
