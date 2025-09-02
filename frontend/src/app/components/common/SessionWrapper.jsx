"use client";
import { SessionProvider } from "next-auth/react";

// -------------------------------------------------------------------
// SessionWrapper
// Provides NextAuth's session context to the entire app.
// - Wraps children with <SessionProvider /> so that hooks like
//   `useSession()` can be used anywhere in the component tree.
// - Typically used at the root level (see layout.js).
// - Props:
//   • children: React nodes → the rest of the app.
// -------------------------------------------------------------------

export default function SessionWrapper({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
