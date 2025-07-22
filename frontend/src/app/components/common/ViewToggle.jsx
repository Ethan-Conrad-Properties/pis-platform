import React from "react";

export default function ViewToggle({
  view,
  onToggle,
  views = ["card", "grid"],
}) {
  const labels = {
    card: "Card View",
    grid: "Excel View",
  };
  const nextView = views.find((v) => v !== view);

  return (
    <button
      className="border bg-white px-3 py-1 mb-4 rounded hover:bg-gray-100 hover:cursor-pointer"
      onClick={() => onToggle(nextView)}
    >
      Switch to {labels[nextView] || nextView}
    </button>
  );
}
