import React from "react";

// -------------------------------------------------------------------
// PropertyDropdown
// Dropdown selector for choosing a property by Yardi ID.
// - Displays property address + yardi in each option.
// - Controlled component → value comes from `selectedPropertyId`.
// - Calls `onSelect` with the chosen property's yardi ID.
// - Props:
//   • properties: array of property objects (must include `yardi` + `address`).
//   • selectedPropertyId: string → currently selected yardi ID.
//   • onSelect: callback(string) → triggered when user picks a property.
// -------------------------------------------------------------------

export default function PropertyDropdown({
  properties,
  selectedPropertyId,
  onSelect,
}) {
  return (
    <select
      className="border bg-white rounded px-2 py-1 mb-4 w-full sm:w-[220px] text-xs md:text-lg"
      value={selectedPropertyId}
      onChange={(e) => onSelect(e.target.value)}
      style={{
        background: "var(--surface)",
        color: "var(--surface-foreground)",
      }}
    >
      {/* Default option */}
      <option value="">-- Select Property --</option>

      {/* Property options */}
      {properties.map((prop) => (
        <option key={prop.yardi} value={prop.yardi}>
          {prop.address} ({prop.yardi})
        </option>
      ))}
    </select>
  );
}
