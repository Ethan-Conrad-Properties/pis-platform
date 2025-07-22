import { signIn } from "next-auth/react";

export default function LoginForm() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-yellow-200 to-orange-200">
      <div className="bg-white shadow-lg rounded-lg py-12 px-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-2">Welcome to the PIS Platform</h1>
        <p className="mb-6 text-gray-700 text-center">
          Please sign in with your Ethan Conrad Properties account to continue.
        </p>
        <button
          onClick={() => signIn("azure-ad")}
          className="bg-yellow-500 text-white px-6 py-2 rounded shadow hover:bg-yellow-600 transition hover:cursor-pointer"
        >
          Login with Ethan Conrad Properties
        </button>
      </div>
    </div>
  );
}
