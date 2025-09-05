import { Geist, Geist_Mono } from "next/font/google";
import SessionWrapper from "./components/common/SessionWrapper";
import "./globals.css";
import QueryProvider from "./components/common/QueryProvider";
import { Analytics } from "@vercel/analytics/next";
import Header from "./components/common/Header";

// -------------------------------------------------------------------
// Root Layout
// This is the global layout for the Next.js app.
// Everything rendered inside <body> is wrapped with global providers.
// -------------------------------------------------------------------

// Custom Google fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata for the entire app (used by Next.js <head>)
export const metadata = {
  title: "Property Information Sheet",
  description: "Manage all properties",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* React Query provider for data fetching/caching */}
        <QueryProvider>
          {/* NextAuth session wrapper (ensures user auth state available) */}
          <SessionWrapper>
            <Header />
            {children}
          </SessionWrapper>
        </QueryProvider>

        {/* Vercel analytics (usage tracking) */}
        <Analytics />
      </body>
    </html>
  );
}
