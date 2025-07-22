import { Geist, Geist_Mono } from "next/font/google";
import SessionWrapper from "./components/common/SessionWrapper";
import "./globals.css";
import QueryProvider from "./components/common/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Property Information Sheet",
  description: "Manage all properties",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <SessionWrapper>
            {children}
          </SessionWrapper>
        </QueryProvider>
      </body>
    </html>
  );
}
