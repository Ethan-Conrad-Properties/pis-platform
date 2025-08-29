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

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const RichTextCellEditor = forwardRef((props, ref) => {
  const [value, setValue] = useState(props.value || "");
  const quillRef = useRef(null);

  useEffect(() => {
    setValue(props.value || "");
  }, [props.value]);

  const handleChange = (v) => {
    console.log("✏️ Quill onChange, new value:", v);
    setValue(v);
    props.onValueChange(v);
  };

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
            ["bold", "italic", "underline"],
            [{ color: [] }],
          ],
        }}
        formats={["bold", "italic", "underline", "color"]}
      />
  );
});

export default RichTextCellEditor;
