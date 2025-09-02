import React from "react";

// -------------------------------------------------------------------
// PaginationControls
// Simple reusable pagination UI.
// - Shows current page and total pages.
// - Provides "Prev" and "Next" buttons with disabled states.
// - Props:
//   • currentPage: number → the page currently shown.
//   • totalPages: number → total number of available pages.
//   • onPrev: callback → triggered when "Prev" is clicked.
//   • onNext: callback → triggered when "Next" is clicked.
// -------------------------------------------------------------------

export default function PaginationControls({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}) {
  return (
    <div className="flex justify-center items-center mt-6 gap-2">
      {/* Previous page button */}
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50 hover:cursor-pointer"
      >
        Prev
      </button>

      {/* Page display */}
      <span>
        Page {currentPage} of {totalPages}
      </span>

      {/* Next page button */}
      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50 hover:cursor-pointer"
      >
        Next
      </button>
    </div>
  );
}
