"use client";
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// -------------------------------------------------------------------
// QueryProvider
// Wraps the app with a React Query client instance.
// - Provides caching, background refetching, and state management
//   for server data (API calls via axiosInstance).
// - Uses `useState` initializer to ensure QueryClient is only
//   created once per component lifecycle.
// - Props:
//   • children: React nodes → the rest of the app/components.
// -------------------------------------------------------------------

export default function QueryProvider({ children }) {
  // Lazily initialize a single QueryClient instance
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
