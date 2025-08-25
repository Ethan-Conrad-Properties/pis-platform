"use client";
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

const RichTextCellEditor = forwardRef((props, ref) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = props.value || "";
      editorRef.current.focus();
    }
  }, [props.value]);

  useImperativeHandle(ref, () => ({
    getValue: () => editorRef.current.innerHTML,
  }));

  const apply = (cmd, value = null) => {
    editorRef.current.focus();
    document.execCommand(cmd, false, value);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {/* small toolbar above text */}
      <div className="flex gap-2 mb-1 text-xs">
        <button type="button" onClick={() => apply("bold")}><b>B</b></button>
        <button type="button" onClick={() => apply("italic")}><i>I</i></button>
        <button type="button" onClick={() => apply("underline")}><u>U</u></button>
        <button type="button" onClick={() => apply("foreColor", "red")}>🔴</button>
        <button type="button" onClick={() => apply("foreColor", "blue")}>🔵</button>
      </div>

      {/* editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        style={{
          minHeight: "100%",
          padding: "4px",
          outline: "none",
          border: "1px solid #ddd",
          whiteSpace: "pre-wrap",
        }}
      />
    </div>
  );
});

RichTextCellEditor.displayName = "RichTextCellEditor";
export default RichTextCellEditor;
