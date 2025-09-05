import { signIn } from "next-auth/react";

/**
 * LoginForm
 *
 * Displays the login screen for the PIS Platform.
 * - Prompts user to sign in with their Ethan Conrad Properties account.
 * - Uses NextAuth's Azure AD provider for authentication.
 *
 * Flow:
 * 1. User clicks "Login" button.
 * 2. NextAuth redirects them to Azure AD login.
 * 3. On success, session + access token are stored and used for API calls.
 */
export default function LoginForm() {
  return (
    <div className="flex items-center px-6 justify-center min-h-screen">
      <div className="bg-white shadow-lg rounded-lg py-6 md:py-12 px-6 md:px-8 flex flex-col items-center">
        <h1 className="text-xl md:text-2xl text-center font-bold mb-2">
          Welcome to the PIS Platform
        </h1>

        <p className="text-sm md:text-lg mb-3 md:mb-6 text-gray-700 text-center">
          Please sign in with your Ethan Conrad Properties account to continue.
        </p>

        <button
          onClick={() => signIn("azure-ad")}
          className="bg-yellow-500 text-white text-sm md:text-lg px-3 md:px-6 py-2 rounded shadow hover:bg-yellow-600 transition hover:cursor-pointer"
        >
          Login with Ethan Conrad Properties
        </button>
      </div>
    </div>
  );
}
