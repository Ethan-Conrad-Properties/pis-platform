import React, { useState } from "react";
import { formatDate } from "@/app/utils/helpers";

// -------------------------------------------------------------------
// ExpandingCell
// AG Grid custom cell renderer with expand/collapse functionality.
// - Truncates long text (200+ chars) and shows "Show more/less" toggles.
// - Preserves line breaks and rich text using dangerouslySetInnerHTML.
// - Special rule: formats "coe" (close of escrow) values as dates.
// - Props (from AG Grid):
//   • value: cell value (string/HTML).
//   • colDef: column definition → used to check if field === "coe".
// -------------------------------------------------------------------
export const ExpandingCell = (props) => {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 200;

  // Handle null/undefined gracefully
  let value = props.value == null ? "" : String(props.value);

  // Apply custom formatting for COE fields
  if (props.colDef.field === "coe" && value) {
    value = formatDate(value);
  }

  if (!value) return null;

  const isLong = value.length > maxLength;
  const truncated = isLong ? value.slice(0, maxLength) + "..." : value;

  return (
    <div className="whitespace-pre-line break-words"
    >
      {/* Toggle between truncated and full text */}
      <span
        dangerouslySetInnerHTML={{ __html: expanded ? value : truncated }}
      />
      {isLong && !expanded && (
        <button
          className="text-blue-600 cursor-pointer ml-1 text-sm"
          onClick={() => setExpanded(true)}
        >
          Show more
        </button>
      )}
      {isLong && expanded && (
        <button
          className="text-blue-600 cursor-pointer ml-1 text-sm"
          onClick={() => setExpanded(false)}
        >
          Show less
        </button>
      )}
    </div>
  );
};

// -------------------------------------------------------------------
// AddIcon
// Simple "+" button used in AG Grid cells or property sections.
// - Emits `onClick` when pressed.
// - Props:
//   • onClick: callback → action triggered when button is clicked.
// -------------------------------------------------------------------
export const AddIcon = ({ onClick }) => (
  <button
    className="bg-transparent border-0 text-blue-600 cursor-pointer text-2xl ml-2 align-middle"
    title="Add"
    aria-label="Add"
    onClick={onClick}
    type="button"
  >
    &#x2795;
  </button>
);
