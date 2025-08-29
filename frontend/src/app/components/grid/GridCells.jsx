import React, { useState } from "react";
import { formatDate } from "@/app/utils/helpers";

export const ExpandingCell = (props) => {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 200;

  let value = props.value == null ? "" : String(props.value);
  if (props.colDef.field === "coe" && value) {
    value = formatDate(value); // keep your custom rule
  }

  if (!value) return null;

  const isLong = value.length > maxLength;
  const truncated = isLong ? value.slice(0, maxLength) + "..." : value;

  return (
    <div className="whitespace-pre-line break-words">
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
