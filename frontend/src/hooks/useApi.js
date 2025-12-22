import { useMemo } from "react";
import axios from "axios";

export const useApi = () => {
   // Get API base URL from environment variables
   const API_BASE = import.meta.env.VITE_API_BASE || "/api";
   const isDevelopment = import.meta.env.VITE_ENV === "development" || import.meta.env.DEV;

   // Axios instance with credentials and CSRF protection
   const api = useMemo(() => {
      const instance = axios.create({
         baseURL: API_BASE,
         headers: { "Content-Type": "application/json" },
         withCredentials: true,
         timeout: 15000, // 15 second timeout
      });

      // CSRF token handling via cookies
      instance.defaults.xsrfCookieName = "XSRF-TOKEN";
      instance.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

      // Log requests in development mode
      if (isDevelopment && import.meta.env.VITE_DEBUG === "true") {
         instance.interceptors.request.use((config) => {
            // console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
            return config;
         });

         instance.interceptors.response.use(
            (response) => {
               // console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
               return response;
            },
            (error) => {
               // console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data || error.message);
               return Promise.reject(error);
            }
         );
      }

      return instance;
   }, [API_BASE, isDevelopment]);

   return api;
};