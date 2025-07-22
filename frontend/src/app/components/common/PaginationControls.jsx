import React from "react";

export default function PaginationControls({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}) {
  return (
    <div className="flex justify-center items-center mt-6 gap-2">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50 hover:cursor-pointer"
      >
        Prev
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
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
