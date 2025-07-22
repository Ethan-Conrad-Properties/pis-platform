import React, { useEffect } from "react";

export default function SuccessModal({
  open,
  onClose,
  message = "Your changes have been saved!",
}) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="bg-gray-100 rounded-lg shadow-lg p-2 min-w-[180px] flex flex-col items-center">
        <span className=" text-xl font-bold">✅ {message}</span>
      </div>
    </div>
  );
}
