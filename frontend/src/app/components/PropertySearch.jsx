import React from "react";

export default function PropertySearch({ value, onChange }) {
  return (
    <input
      type="text"
      placeholder="Search properties..."
      value={value}
      onChange={onChange}
      className="mb-2 md:mb-4 p-1 md:p-2 border border-black rounded w-full md:w-1/4"
    />
  );
}