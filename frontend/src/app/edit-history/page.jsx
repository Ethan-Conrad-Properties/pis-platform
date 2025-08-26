"use client"

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import SessionTimeout from "../components/common/SessionTimeout";
import Link from "next/link";

export default function EditHistoryPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["edit-history"],
    queryFn: async () => {
      const res = await axiosInstance.get("/edit-history");
      return res.data.edit_history;
    },
  });

  return (
    <div className="bg-gradient-to-r from-yellow-200 to-orange-200 w-full min-h-screen px-4 md:px-36 pt-8 md:pt-16 pb-4 md:pb-6">
      <Link href="/" className="underline text-blue-600 mb-4 block">← Back to Home</Link>
      <h1 className="text-2xl md:text-4xl text-center md:text-left font-bold mb-4 justify-between">
        Edit History
      </h1>
      <SessionTimeout />
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error loading edit history.</div>
      ) : !data || data.length === 0 ? (
        <div>No edits found.</div>
      ) : (
        <ul>
          {data.map(h => (
            <li key={h.id} className="mb-2">
              <strong>{h.edited_at}</strong>: {h.edited_by} changed <strong>{h.entity_type}</strong> (<strong>{h.entity_id}</strong>) field <strong>{h.field}</strong> from "{h.old_value}" to "{h.new_value}"
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}