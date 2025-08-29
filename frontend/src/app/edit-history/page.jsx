"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axiosInstance";
import { paginate } from "@/app/utils/helpers";
import SessionTimeout from "../components/common/SessionTimeout";
import Link from "next/link";
import PaginationControls from "../components/common/PaginationControls";

// ✅ helper to clean up Quill HTML for logs
const stripQuillHtml = (html = "") => {
  if (!html) return "";

  return html
    // turn paragraphs and breaks into line breaks
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/p>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    // remove formatting tags but keep text
    .replace(/<\/?(b|i|u)[^>]*>/gi, "")
    .replace(/<span[^>]*>/gi, "")
    .replace(/<\/span>/gi, "")
    // strip anything else just in case
    .replace(/<[^>]+>/g, "")
    .trim();
};

export default function EditHistoryPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["edit-history"],
    queryFn: async () => {
      const res = await axiosInstance.get("/edit-history");
      return res.data.edit_history;
    },
  });

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading edit history.</div>;
  if (!data || data.length === 0) return <div>No edits found.</div>;

  // paginate data
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentItems = paginate(data, currentPage, itemsPerPage);

  return (
    <div className="bg-gradient-to-r from-yellow-200 to-orange-200 w-full min-h-screen px-4 md:px-36 pt-8 md:pt-16 pb-4 md:pb-6">
      <Link href="/" className="underline text-blue-600 mb-4 block">
        ← Back to Home
      </Link>
      <h1 className="text-2xl md:text-4xl text-center md:text-left font-bold mb-4">
        Edit History
      </h1>
      <SessionTimeout />

      <ul className="space-y-3">
        {currentItems.map((h) => {
          let badgeColor = "bg-gray-300 text-gray-800";
          if (h.action === "add") badgeColor = "bg-green-200 text-green-800";
          if (h.action === "edit") badgeColor = "bg-yellow-200 text-yellow-800";
          if (h.action === "delete") badgeColor = "bg-red-200 text-red-800";

          return (
            <li key={h.id} className="bg-white rounded-lg shadow px-4 py-2">
              <div className="text-sm text-gray-600">{h.edited_at}</div>
              <div>
                <span className="font-semibold">{h.edited_by}</span>{" "}
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${badgeColor}`}
                >
                  {h.action.toUpperCase()}
                </span>{" "}
                {h.action === "edit" && (
                  <>
                    changed{" "}
                    <span className="font-semibold">{h.entity_type}</span> (
                    <span className="italic">{h.entity_id}</span>) field{" "}
                    <span className="font-semibold">{h.field}</span> from "
                    {stripQuillHtml(h.old_value)}" to "
                    {stripQuillHtml(h.new_value)}"
                  </>
                )}
                {h.action === "add" && (
                  <>
                    added{" "}
                    <span className="font-semibold">{h.entity_type}</span> (
                    <span className="italic">{h.entity_id}</span>)
                  </>
                )}
                {h.action === "delete" && (
                  <>
                    deleted{" "}
                    <span className="font-semibold">{h.entity_type}</span> (
                    <span className="italic">{h.entity_id}</span>)
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
      />
    </div>
  );
}
