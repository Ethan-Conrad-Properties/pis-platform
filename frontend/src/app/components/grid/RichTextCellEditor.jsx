"use client";

import dynamic from "next/dynamic";
import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import "react-quill-new/dist/quill.snow.css";

// Lazy-load Quill to avoid SSR issues in Next.js
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

/**
 * RichTextCellEditor
 * -------------------
 * A custom AG Grid cell editor that uses React Quill (WYSIWYG editor).
 *
 * Purpose:
 *  - Allows inline rich-text editing (bold, italic, underline, colors)
 *  - Handles AG Grid lifecycle via `forwardRef` + `useImperativeHandle`
 *  - Provides value back to grid when editing finishes
 *
 * Props (injected by AG Grid):
 *  - value: initial cell value
 *  - onValueChange: AG Grid callback to update value in real-time
 *
 * Exposed via ref:
 *  - getValue(): returns the final value when editing completes
 */
const RichTextCellEditor = forwardRef((props, ref) => {
  const [value, setValue] = useState(props.value || "");
  const quillRef = useRef(null);

  // Sync local state if external value changes
  useEffect(() => {
    setValue(props.value || "");
  }, [props.value]);

  // Handle user typing in Quill
  const handleChange = (v) => {
    console.log("✏️ Quill onChange, new value:", v);
    setValue(v);
    props.onValueChange(v);
  };

  // Required by AG Grid: returns final value on save
  useImperativeHandle(ref, () => ({
    getValue: () => {
      console.log("📤 getValue called, returning:", value);
      return value;
    },
  }));

  return (
    <ReactQuill
      className="bg-white"
      ref={quillRef}
      value={value}
      onChange={handleChange}
      theme="snow"
      modules={{
        toolbar: [
          ["bold", "italic", "underline"], // basic text styles
          [{ color: [] }], // text colors
        ],
      }}
      formats={["bold", "italic", "underline", "color"]}
    />
  );
});

export default RichTextCellEditor;
