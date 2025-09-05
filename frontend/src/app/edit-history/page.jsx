"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axiosInstance";
import { paginate } from "@/app/utils/helpers";
import Link from "next/link";
import PaginationControls from "../components/common/PaginationControls";
import LoginForm from "@/app/Login";
import { useSession } from "next-auth/react";

// -------------------------------------------------------------------
// EditHistoryPage
// Displays a paginated list of all edit logs from the backend.
// - Fetches edit history from `/edit-history` API.
// - Shows action type (add/edit/delete) with a colored badge.
// - Formats timestamps for readability.
// - Strips rich-text/Quill HTML from stored values for cleaner display.
// -------------------------------------------------------------------

// Helper: remove Quill formatting tags and return plain text
const stripQuillHtml = (html = "") => {
  if (!html) return "";
  return html
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/p>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(b|i|u)[^>]*>/gi, "")
    .replace(/<span[^>]*>/gi, "")
    .replace(/<\/span>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
};

// Helper: format ISO timestamp into readable date/time
const formatTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function EditHistoryPage() {
  // auth guard
  const { data: session } = useSession();
    if (!session) {
      return <LoginForm />;
    }

  // Fetch edit history logs
  const { data, error, isLoading } = useQuery({
    queryKey: ["edit-history"],
    queryFn: async () => {
      const res = await axiosInstance.get("/edit-history");
      return res.data.edit_history;
    },
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = data ? Math.ceil(data.length / itemsPerPage) : 1;
  const currentItems = data ? paginate(data, currentPage, itemsPerPage) : [];

  return (
    <div className="px-4 md:px-36 pt-8 md:pt-16 pb-4 md:pb-6">
      {/* Back navigation */}
      <Link href="/" className="underline mb-4 block">
        ← Back to Home
      </Link>

      <h1 className="text-2xl md:text-4xl text-center md:text-left font-bold mb-4">
        Edit History
      </h1>

      {/* Loading / error / empty states */}
      {isLoading && <div>Loading...</div>}
      {error && <div>Error loading edit history.</div>}
      {!isLoading && !error && data?.length === 0 && <div>No edits found.</div>}

      {/* Logs list */}
      {!isLoading && !error && data?.length > 0 && (
        <>
          <ul className="space-y-3">
            {currentItems.map((h) => {
              let badgeColor = "bg-gray-300 text-gray-800";
              if (h.action === "add")
                badgeColor = "bg-green-200 text-green-800";
              if (h.action === "edit")
                badgeColor = "bg-yellow-200 text-yellow-800";
              if (h.action === "delete") badgeColor = "bg-red-200 text-red-800";

              return (
                <li
                  key={h.id}
                  className="bg-white rounded-lg shadow px-4 py-2"
                  style={{
                    background: "var(--surface)",
                    color: "var(--surface-foreground)",
                  }}
                >
                  <div className="text-sm text-gray-600">
                    {formatTime(h.edited_at)}
                  </div>
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

          {/* Pagination controls */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          />
        </>
      )}
    </div>
  );
}
