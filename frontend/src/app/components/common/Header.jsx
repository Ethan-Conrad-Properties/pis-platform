"use client";
import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { createChat } from "@n8n/chat";
import ThemeToggle from "./ThemeToggle";
import SessionTimeout from "./SessionTimeout";
import "@n8n/chat/style.css";

export default function Header() {
  const { data: session, status } = useSession();

  // Init chatbot only after login
  useEffect(() => {
    if (status === "authenticated" && typeof window !== "undefined") {
      if (!window.__chatMounted) {
        window.__chatMounted = true;
        createChat({
          webhookUrl:
            "https://n8n.srv945784.hstgr.cloud/webhook/82cc73c3-a75f-4542-b7bf-a036201b1351/chat",
          initialMessages: [
            "I am your personal PIS chatbot. How can I assist you today?",
          ],
          i18n: {
            en: {
              title: "Hi there! 👋",
              subtitle: "Start a chat. I'm here to help you 24/7.",
              inputPlaceholder: "Type your question..",
            },
          },
        });
      }
    }
  }, [status]);

  // Don't render header if not logged in
  if (status !== "authenticated") return null;

  return (
    <>
      <SessionTimeout />
      <div className="flex justify-end items-center p-4 space-x-2">
        <ThemeToggle />
        <button
          onClick={() => signOut()}
          className="bg-white dark:bg-gray-700 border border-black dark:border-gray-400 px-3 py-1 rounded shadow cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
          style={{
            background: "var(--surface)",
            color: "var(--surface-foreground)",
          }}
        >
          Logout
        </button>
      </div>
    </>
  );
}
