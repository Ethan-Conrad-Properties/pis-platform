import React, { useEffect } from "react";

// -------------------------------------------------------------------
// SuccessModal
// Temporary notification popup to confirm a successful action.
// - Auto-closes after 2 seconds.
// - Props:
//   • open: boolean → whether modal is visible.
//   • onClose: callback → triggered when modal auto-closes.
//   • message: string → success text (defaults to "Your changes have been saved!").
// -------------------------------------------------------------------

export default function SuccessModal({
  open,
  onClose,
  message = "Your changes have been saved!",
}) {
  // Auto-close after 2 seconds when `open` becomes true
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  // Don’t render if not open
  if (!open) return null;

  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="bg-gray-100 text-black rounded-lg shadow-lg p-2 min-w-[180px] flex flex-col items-center">
        <span className="text-xl font-bold">✅ {message}</span>
      </div>
    </div>
  );
}
