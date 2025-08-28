import dynamic from "next/dynamic";
import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const RichTextCellEditor = forwardRef((props, ref) => {
  const [value, setValue] = useState(props.value || "");
  const quillRef = useRef(null);

  useEffect(() => {
    console.log("🟢 RichTextCellEditor mounted");

    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      console.log("🟢 Quill editor object:", editor);

      editor.root.addEventListener("focus", () => {
        console.log("✨ Quill got focus");
      });
      editor.root.addEventListener("blur", () => {
        console.log("💤 Quill lost focus");
      });
      editor.root.addEventListener("keydown", (e) => {
        console.log("⌨️ Quill keydown:", e.key);
      });
    }

    return () => console.log("🔴 RichTextCellEditor unmounted");
  }, []);

  useImperativeHandle(ref, () => ({
    getValue: () => value,
  }));

  return (
    <ReactQuill
      ref={quillRef}
      value={value}
      onChange={(val) => {
        console.log("✏️ Value changed:", val);
        setValue(val);
      }}
      theme="bubble"
      modules={{
        toolbar: false, // still hide toolbar
        keyboard: true, // enable keyboard shortcuts
      }}
      formats={["bold", "italic", "underline", "color"]} // allow formatting
    />
  );
});

export default RichTextCellEditor;
