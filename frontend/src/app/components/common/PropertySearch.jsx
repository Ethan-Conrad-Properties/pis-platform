import React from "react";

// -------------------------------------------------------------------
// PropertySearch
// Reusable search input for filtering properties.
// - Controlled input → value comes from parent via `value` prop.
// - Calls `onChange` whenever user types.
// - Props:
//   • value: string → current search query.
//   • onChange: function(event) → updates search query in parent.
//   • placeholder: string → placeholder text to guide user.
// -------------------------------------------------------------------

export default function PropertySearch({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="mb-2 md:mb-4 p-1 md:p-2 border border-black rounded w-2/3 md:w-1/3"
      
    />
  );
}
