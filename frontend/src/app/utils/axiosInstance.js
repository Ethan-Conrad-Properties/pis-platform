import axios from "axios";
import { getSession, signOut } from "next-auth/react";

// -------------------------------------------------------------------
// Axios Instance
// This wrapper is used for ALL API requests to the FastAPI backend.
// It automatically attaches the user's auth token and handles
// unauthorized errors (401).
// -------------------------------------------------------------------

// Base API URL (comes from .env.local or deployment environment)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Create Axios instance with base URL
const axiosInstance = axios.create({
  baseURL: apiUrl,
});

// ---------------------------------------------------
// Request Interceptor
// Runs BEFORE every request. Attaches auth token if present.
// ---------------------------------------------------
axiosInstance.interceptors.request.use(async (config) => {
  const session = await getSession(); // next-auth session
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

// Prevent multiple concurrent sign-outs (avoid spam)
let signOutInProgress = false;

// ---------------------------------------------------
// Response Interceptor
// Runs AFTER every response. If backend says 401 Unauthorized:
// - Shows an error message
// - Forces user to sign out
// ---------------------------------------------------
axiosInstance.interceptors.response.use(
  (response) => response, // pass through on success
  async (error) => {
    if (error.response?.status === 401 && !signOutInProgress) {
      signOutInProgress = true;
      const session = await getSession();
      let message = "Authentication error. Please sign in again.";

      // Inspect backend error details for better messaging
      const errorData = error.response?.data;
      if (errorData?.detail && typeof errorData.detail === "string") {
        if (errorData.detail.toLowerCase().includes("expired")) {
          message = "Your session has expired. Please sign in again.";
        } else if (errorData.detail.toLowerCase().includes("invalid")) {
          message = "Your session is invalid. Please sign in again.";
        } else if (errorData.detail.toLowerCase().includes("missing")) {
          message = "Authentication token missing. Please sign in again.";
        }
      }

      // If user has a session, alert them and force sign-out
      if (session) {
        alert(message);
        await signOut();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
