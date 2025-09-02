import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hr (auto logout time)
const WARNING_TIME = 2 * 60 * 1000; // 2 minutes before logout

// -------------------------------------------------------------------
// SessionTimeout
// Handles automatic logout after inactivity.
// - Tracks mouse and keyboard activity to reset the session timer.
// - Shows a warning popup shortly before session expiration.
// - Calls NextAuth's `signOut` when timeout is reached.
// -------------------------------------------------------------------

export default function SessionTimeout() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    let timeout, warning;

    // Resets session + warning timers on user activity
    const resetTimer = () => {
      clearTimeout(timeout);
      clearTimeout(warning);
      setShowWarning(false);

      // Show warning slightly before full logout
      warning = setTimeout(
        () => setShowWarning(true),
        SESSION_TIMEOUT - WARNING_TIME
      );

      // Force logout when session expires
      timeout = setTimeout(() => signOut(), SESSION_TIMEOUT);
    };

    // Listen for user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    // Initialize timers on mount
    resetTimer();

    // Cleanup on unmount
    return () => {
      clearTimeout(timeout);
      clearTimeout(warning);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, []);

  // Render session expiration warning
  return showWarning ? (
    <div className="fixed top-4 right-4 bg-yellow-200 border border-yellow-600 px-4 py-2 rounded shadow-lg z-50">
      Your session will expire in 2 minutes due to inactivity.
    </div>
  ) : null;
}
