// src/utils/axiosInstance.js
import axios from "axios";
import { getAuthHeader } from "./auth"; // Ensure './auth' correctly points to 'auth.js'

console.log("Imported getAuthHeader:", getAuthHeader); // Debugging log

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000", // Adjust the base URL as needed
});

// Add a request interceptor to include Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const authHeader = getAuthHeader();
    console.log("Auth Header:", authHeader); // Debugging log
    config.headers = {
      ...config.headers,
      ...authHeader,
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;