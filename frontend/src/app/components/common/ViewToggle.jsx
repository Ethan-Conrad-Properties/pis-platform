import React from "react";

// -------------------------------------------------------------------
// ViewToggle
// Simple toggle button to switch between property views.
// - By default toggles between "card" and "grid".
// - Displays the *next* view in the button text.
// - Props:
//   • view: string → current view (e.g. "card" or "grid").
//   • onToggle: callback(string) → called with the next view.
//   • views: array → list of available views (default: ["card", "grid"]).
// -------------------------------------------------------------------

export default function ViewToggle({
  view,
  onToggle,
  views = ["card", "grid"],
}) {
  // Human-friendly labels for known views
  const labels = {
    card: "Card View",
    grid: "Excel View",
  };

  // Figure out the "next" view (the one not currently active)
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
