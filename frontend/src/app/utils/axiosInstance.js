import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: apiUrl,
});

// Attach the access token to every request
axiosInstance.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

// Prevent multiple concurrent sign-outs
let signOutInProgress = false;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !signOutInProgress) {
      signOutInProgress = true;
      const session = await getSession();
      let message = "Authentication error. Please sign in again.";
      // Inspect error response for token details
      const errorData = error.response?.data;
      if (errorData?.detail) {
        if (typeof errorData.detail === "string") {
          if (errorData.detail.toLowerCase().includes("expired")) {
            message = "Your session has expired. Please sign in again.";
          } else if (errorData.detail.toLowerCase().includes("invalid")) {
            message = "Your session is invalid. Please sign in again.";
          } else if (errorData.detail.toLowerCase().includes("missing")) {
            message = "Authentication token missing. Please sign in again.";
          }
        }
      }
      if (session) {
        alert(message);
        await signOut();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
