import React, { useState, useEffect } from "react";

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

export default function ViewToggle({ view, onChange }) {
  const handleToggle = () => {
    const newView = view === "card" ? "grid" : "card";
    if (onChange) onChange(newView);
  };

  const labels = {
    card: "Card View",
    grid: "Excel View",
  };

  const nextView = view === "card" ? "grid" : "card";

  return (
    <button
      className="border bg-white px-3 py-1 mb-4 rounded hover:bg-gray-100 hover:cursor-pointer"
      onClick={handleToggle}
      style={{
        background: "var(--surface)",
        color: "var(--surface-foreground)",
      }}
    >
      Switch to {labels[nextView] || nextView}
    </button>
  );
}