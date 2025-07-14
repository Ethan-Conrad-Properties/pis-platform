import { signIn } from "next-auth/react";

export default function LoginForm() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <button
        onClick={() => signIn('azure-ad')}
        className="border border-black px-4 py-2 rounded hover:bg-gray-100 hover:cursor-pointer"
      >
        Login with Azure AD
      </button>
    </div>
  );
}