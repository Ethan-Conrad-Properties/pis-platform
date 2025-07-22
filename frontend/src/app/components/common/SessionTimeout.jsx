import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hr
const WARNING_TIME = 2 * 60 * 1000; // 2 minutes before logout

export default function SessionTimeout() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    let timeout, warning;
    const resetTimer = () => {
      clearTimeout(timeout);
      clearTimeout(warning);
      setShowWarning(false);
      warning = setTimeout(
        () => setShowWarning(true),
        SESSION_TIMEOUT - WARNING_TIME
      );
      timeout = setTimeout(() => signOut(), SESSION_TIMEOUT);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeout);
      clearTimeout(warning);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, []);

  return showWarning ? (
    <div className="fixed top-4 right-4 bg-yellow-200 border border-yellow-600 px-4 py-2 rounded shadow-lg z-50">
      Your session will expire in 10 seconds due to inactivity.
    </div>
  ) : null;
}
