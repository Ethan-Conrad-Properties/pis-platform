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

// Sign out globally on 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const session = await getSession();
      if (session) {
        alert("Your session has expired, please sign in again.");
        signOut();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;