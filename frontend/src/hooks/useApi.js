import { useMemo } from "react";
import axios from "axios";

/**
 * Custom hook that provides a configured axios instance for API requests.
 *
 * Features:
 * - Automatic CSRF token handling via cookies
 * - Credentials included in all requests (for httpOnly cookies)
 * - Request/response logging in development mode
 * - Automatic CSRF token refresh on 403 errors
 * - Base URL configuration from environment variables
 *
 * @returns {AxiosInstance} Configured axios instance
 */
export const useApi = () => {
   // ============================================================================
   // CONFIGURATION
   // ============================================================================

   // Get API base URL from environment variables, default to "/api"
   const API_BASE = import.meta.env.VITE_API_BASE || "/api";

   // Determine if we're in development mode
   const isDevelopment = import.meta.env.VITE_ENV === "development" || import.meta.env.DEV;

   // Check if debug logging is enabled
   const isDebugEnabled = import.meta.env.VITE_DEBUG === "true";

   // ============================================================================
   // AXIOS INSTANCE CREATION
   // ============================================================================

   /**
    * Creates and configures the axios instance with all necessary settings.
    * Memoized to prevent recreation on every render.
    */
   const api = useMemo(() => {
      // Create axios instance with base configuration
      const instance = axios.create({
         baseURL: API_BASE, // Base URL for all requests
         headers: {
            "Content-Type": "application/json", // Default to JSON requests
         },
         withCredentials: true, // Include cookies in requests (for httpOnly cookies)
         timeout: 15000, // 15 second timeout for requests
      });

      // =========================================================================
      // CSRF TOKEN CONFIGURATION
      // =========================================================================

      /**
       * Configure CSRF token handling.
       * Flask-JWT-Extended stores CSRF tokens in cookies, and we need to
       * send them back in request headers for verification.
       */
      instance.defaults.xsrfCookieName = "csrf_access_token"; // Cookie name to read from
      instance.defaults.xsrfHeaderName = "X-CSRF-TOKEN"; // Header name to send to

      // =========================================================================
      // DEVELOPMENT MODE LOGGING
      // =========================================================================

      /**
       * Add request/response logging interceptors in development mode.
       * Helps with debugging API calls and responses.
       */
      if (isDevelopment && isDebugEnabled) {
         // Log outgoing requests
         instance.interceptors.request.use((config) => {
            return config;
         });

         // Log incoming responses and errors
         instance.interceptors.response.use(
            (response) => {
               return response;
            },
            (error) => {
               // Don't spam console with connection errors
               if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED") {
                  console.warn(`[API] Cannot reach backend at ${error.config?.url}. Is the server running?`);
               } else {
                  console.error(
                     `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
                     error.response?.data || error.message
                  );
               }
               return Promise.reject(error);
            }
         );
      }

      // =========================================================================
      // CSRF TOKEN RETRY INTERCEPTOR
      // =========================================================================

      /**
       * Automatically refresh CSRF token and retry request on 403 errors.
       *
       * Why this is needed:
       * - CSRF tokens can expire or become invalid
       * - Instead of failing the request, we fetch a new token and retry
       * - Only retries once to prevent infinite loops
       */
      instance.interceptors.response.use(
         (response) => response, // Pass through successful responses
         async (error) => {
            const originalRequest = error.config;

            // Check if this is a CSRF-related 403 error
            const is403Error = error.response?.status === 403;
            const isCsrfError = error.response?.data?.msg?.includes("CSRF");
            const notRetriedYet = !originalRequest._csrfRetry;

            if (is403Error && isCsrfError && notRetriedYet) {

               // Mark request as retried to prevent infinite loops
               originalRequest._csrfRetry = true;

               try {
                  // Fetch a fresh CSRF token
                  const csrfRes = await instance.get("/csrf-token");
                  const token = csrfRes?.data?.csrfToken;

                  if (token) {

                     // Update all CSRF header variants
                     instance.defaults.headers.common["X-CSRF-TOKEN"] = token;
                     instance.defaults.headers.common["X-XSRF-TOKEN"] = token;
                     instance.defaults.headers.common["X-CSRFToken"] = token;

                     // Retry the original request with new token
                     return instance(originalRequest);
                  } else {
                     console.error("❌ Failed to obtain new CSRF token");
                  }
               } catch (csrfError) {
                  console.error("❌ CSRF token refresh failed:", csrfError);
               }
            }

            // Not a CSRF error or already retried - reject the error
            return Promise.reject(error);
         }
      );

      return instance;
   }, [API_BASE, isDevelopment, isDebugEnabled]);

   return api;
};
