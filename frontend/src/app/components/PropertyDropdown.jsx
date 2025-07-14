import React from "react";

export default function PropertyDropdown({ properties, selectedPropertyId, onSelect }) {
  return (
    <select
      className="border rounded px-2 py-1 mb-4"
      value={selectedPropertyId}
      onChange={e => onSelect(e.target.value)}
    >
      <option value="">-- Select Property --</option>
      {properties.map(prop => (
        <option key={prop.yardi} value={prop.yardi}>
          {prop.address} ({prop.yardi})
        </option>
      ))}
    </select>
  );
}