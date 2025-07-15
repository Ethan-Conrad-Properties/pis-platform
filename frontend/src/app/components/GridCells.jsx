import React, { useState } from "react";

export const ExpandingCell = props => {
  const [expanded, setExpanded] = useState(false);
	const maxLength = 200;
	let value = props.value || "";
  if (props.colDef.field === "coe" && value) {
    const date = new Date(value);
    value = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }

   if (!value) return null;

  const isLong = value.length > maxLength;
  const displayValue = !expanded && isLong
    ? value.slice(0, maxLength) + "..."
    : value;

  return (
    <div style={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
      {displayValue}
      {isLong && !expanded && (
        <span
          style={{ color: "#2563eb", cursor: "pointer", marginLeft: 4, fontSize: "0.9em" }}
          onClick={() => setExpanded(true)}
        >
          Show more
        </span>
      )}
      {isLong && expanded && (
        <span
          style={{ color: "#2563eb", cursor: "pointer", marginLeft: 4, fontSize: "0.9em" }}
          onClick={() => setExpanded(false)}
        >
          Show less
        </span>
      )}
    </div>
  );
};

export const AddIcon = ({ onClick }) => (
  <button
    style={{
      background: "none",
      border: "none",
      color: "#2563eb",
      cursor: "pointer",
      fontSize: "1.5rem",
      marginLeft: "8px",
      verticalAlign: "middle"
    }}
    title="Add"
    onClick={onClick}
  >
    &#x2795;
  </button>
);