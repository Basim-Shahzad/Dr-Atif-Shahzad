import { createContext, useState, useEffect, useMemo, useCallback } from "react";
import { useApi } from "../hooks/useApi";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
   const api = useApi();

   // ============================================================================
   // STATE MANAGEMENT
   // ============================================================================

   // Current authenticated user object (null if not logged in)
   const [user, setUser] = useState(null);

   // Loading state for async operations (login, register, etc.)
   const [loading, setLoading] = useState(true);

   // Flag to indicate if the auth system has completed initial setup
   const [isInitialized, setIsInitialized] = useState(false);

   // ============================================================================
   // CSRF TOKEN MANAGEMENT
   // ============================================================================

   /**
    * Fetches a fresh CSRF token from the server and sets it in axios headers.
    * CSRF tokens protect against Cross-Site Request Forgery attacks.
    *
    * @returns {Promise<string|null>} The CSRF token or null if fetch failed
    */
   const fetchCsrfToken = useCallback(async () => {
      try {
         const res = await api.get("/csrf-token");
         const token = res?.data?.csrfToken;

         if (token) {
            api.defaults.headers.common["X-CSRF-TOKEN"] = token;
            api.defaults.headers.common["X-XSRF-TOKEN"] = token;
            api.defaults.headers.common["X-CSRFToken"] = token;
         }

         return token;
      } catch (err) {
         // Only warn if it's not a connection error
         if (err.code !== "ERR_NETWORK") {
            console.warn("Failed to fetch CSRF token:", err.message);
         }
         return null;
      }
   }, [api]);

   // ============================================================================
   // USER DATA FETCHING
   // ============================================================================

   /**
    * Fetches the current authenticated user's data from the server.
    * This is called on app initialization and after login/register.
    */
   const fetchCurrentUser = useCallback(async () => {
      try {
         const res = await api.get("/me");
         setUser(res.data?.user || null);
      } catch (err) {
         // Don't log 401 errors OR network errors
         if (err.response?.status !== 401 && err.code !== "ERR_NETWORK") {
            console.error("Failed to fetch current user:", err.message);
         }
         setUser(null);
      }
   }, [api]);

   /**
    * Manually refresh user data without needing to re-authenticate.
    * Useful after profile updates or role changes.
    */
   const refreshUser = useCallback(async () => {
      await fetchCurrentUser();
   }, [fetchCurrentUser]);

   // ============================================================================
   // TOKEN REFRESH MECHANISM
   // ============================================================================

   /**
    * Refreshes the access token using the refresh token stored in httpOnly cookie.
    * Access tokens expire after 15 minutes, but refresh tokens last 7 days.
    *
    * @returns {Promise<{success: boolean}>} Success status of refresh operation
    */
   const refreshAccessToken = useCallback(async () => {
      try {
         const res = await api.post("/refresh");

         if (res.data?.user) {
            setUser(res.data.user);
            // Get a fresh CSRF token after refreshing access token
            await fetchCsrfToken();
            return { success: true };
         }

         return { success: false };
      } catch (err) {
         console.error("Token refresh failed:", err);
         return { success: false };
      }
   }, [api, fetchCsrfToken]);

   // ============================================================================
   // AUTOMATIC TOKEN REFRESH (PROACTIVE)
   // ============================================================================

   /**
    * Sets up an interval to automatically refresh the access token every 10 minutes.
    * This prevents tokens from expiring (15 min lifetime) during active sessions.
    * Only runs when user is logged in.
    */
   useEffect(() => {
      if (!user) return;

      // Refresh every 10 minutes (before 15-minute expiration)
      const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

      const interval = setInterval(async () => {
         const result = await refreshAccessToken();

         if (!result.success) {
            console.warn("⚠️ Automatic token refresh failed");
         }
      }, REFRESH_INTERVAL);

      // Clean up interval when user logs out or component unmounts
      return () => clearInterval(interval);
   }, [user, refreshAccessToken]);

   // ============================================================================
   // 401 INTERCEPTOR WITH AUTOMATIC RETRY
   // ============================================================================

   /**
    * Sets up an axios interceptor to handle 401 Unauthorized responses.
    * When a 401 occurs:
    * 1. Attempts to refresh the access token
    * 2. Retries the original failed request with new token
    * 3. Queues multiple concurrent requests to avoid refresh race conditions
    */
   useEffect(() => {
      // Flag to track if we're currently refreshing the token
      let isRefreshing = false;

      // Queue to hold requests that came in while refreshing
      let failedQueue = [];

      /**
       * Processes all queued requests after refresh completes.
       * Either resolves them (if refresh succeeded) or rejects them (if failed).
       */
      const processQueue = (error, token = null) => {
         failedQueue.forEach((prom) => {
            if (error) {
               prom.reject(error);
            } else {
               prom.resolve(token);
            }
         });
         failedQueue = [];
      };

      const interceptor = api.interceptors.response.use(
         (response) => response, // Pass through successful responses
         async (error) => {
            const originalRequest = error.config;

            // Check if this is a 401 error and we haven't tried refreshing yet
            if (error.response?.status === 401 && !originalRequest._retry) {
               // If already refreshing, queue this request
               if (isRefreshing) {
                  return new Promise((resolve, reject) => {
                     failedQueue.push({ resolve, reject });
                  })
                     .then(() => api(originalRequest)) // Retry after refresh completes
                     .catch((err) => Promise.reject(err));
               }

               // Mark request as retried to prevent infinite loops
               originalRequest._retry = true;
               isRefreshing = true;

               try {
                  const refreshResult = await refreshAccessToken();

                  if (refreshResult.success) {
                     processQueue(null, true);
                     return api(originalRequest); // Retry the original request
                  } else {
                     // Refresh failed - log user out
                     console.error("❌ Token refresh failed, logging out");
                     processQueue(new Error("Token refresh failed"), null);
                     setUser(null);
                     return Promise.reject(error);
                  }
               } catch (refreshError) {
                  // Unexpected error during refresh
                  console.error("❌ Unexpected error during token refresh:", refreshError);
                  processQueue(refreshError, null);
                  setUser(null);
                  return Promise.reject(refreshError);
               } finally {
                  isRefreshing = false;
               }
            }

            // Not a 401 or already retried - reject the error
            return Promise.reject(error);
         }
      );

      // Clean up interceptor when component unmounts
      return () => {
         api.interceptors.response.eject(interceptor);
      };
   }, [api, refreshAccessToken]);

   // ============================================================================
   // INITIALIZATION ON APP LOAD
   // ============================================================================

   /**
    * Runs once when the app loads:
    * 1. Fetches a CSRF token for secure requests
    * 2. Checks if user is already logged in (via httpOnly cookie)
    * 3. Sets initialization flag to show UI
    */
   useEffect(() => {
      const initialize = async () => {
         setLoading(true);

         await fetchCsrfToken();
         await fetchCurrentUser();

         setIsInitialized(true);
         setLoading(false);
      };

      initialize();
   }, [fetchCsrfToken, fetchCurrentUser]);

   // ============================================================================
   // SESSION EXPIRATION WARNING
   // ============================================================================

   /**
    * Warns user 2 minutes before their refresh token expires (7-day lifetime).
    * This gives them time to save work before being logged out.
    */
   useEffect(() => {
      if (!user) return;

      // Refresh tokens expire after 7 days - warn 2 minutes before
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
      const TWO_MINUTES_MS = 2 * 60 * 1000;
      const WARNING_TIME = SEVEN_DAYS_MS - TWO_MINUTES_MS;

      const timeout = setTimeout(() => {
         console.warn("⚠️ Your session will expire in 2 minutes. Please save your work.");
         // TODO: You can add a toast notification here
         // toast.warning("Your session will expire soon. Please save your work.");
      }, WARNING_TIME);

      return () => clearTimeout(timeout);
   }, [user]);

   // ============================================================================
   // AUTHENTICATION OPERATIONS
   // ============================================================================

   /**
    * Logs in a user with email and password.
    * On success: sets user state and refreshes CSRF token.
    *
    * @param {string} email - User's email address
    * @param {string} password - User's password
    * @returns {Promise<{success: boolean, user?: object, error?: string}>}
    */
   const login = useCallback(
      async (email, password) => {
         try {
            setLoading(true);
            const res = await api.post("/login", { email, password });

            if (res.data?.user) {
               setUser(res.data.user);
               await fetchCsrfToken(); // Refresh CSRF after login
               return { success: true, user: res.data.user };
            }

            return { success: false, error: "Invalid response from server" };
         } catch (err) {
            const errorMessage =
               err.response?.data?.error ||
               err.response?.data?.message ||
               (err.response ? `Login failed (${err.response.status})` : "Login failed. Please try again.");

            console.error("❌ Login failed:", errorMessage);
            return { success: false, error: errorMessage };
         } finally {
            setLoading(false);
         }
      },
      [api, fetchCsrfToken]
   );

   /**
    * Registers a new user account.
    * On success: automatically logs them in and sets user state.
    *
    * @param {object} userData - Object containing email, password, name, etc.
    * @returns {Promise<{success: boolean, user?: object, error?: string}>}
    */
   const register = useCallback(
      async (userData) => {
         try {
            setLoading(true);
            const res = await api.post("/register", userData);

            if (res.data?.user) {
               setUser(res.data.user);
               await fetchCsrfToken(); // Refresh CSRF after registration

               return { success: true, user: res.data.user };
            }

            return { success: false, error: "Registration failed" };
         } catch (err) {
            const errorMessage = err.response?.data?.error || "Registration failed";
            console.error("❌ Registration failed:", errorMessage);
            return { success: false, error: errorMessage };
         } finally {
            setLoading(false);
         }
      },
      [api, fetchCsrfToken]
   );

   /**
    * Logs out the current user.
    * Clears user state and removes CSRF tokens from headers.
    */
   const logout = useCallback(async () => {
      try {
         setLoading(true);
         await api.post("/logout");
      } catch (err) {
         console.error("❌ Logout error:", err.message);
      } finally {
         // Clear CSRF tokens from axios headers
         delete api.defaults.headers.common["X-CSRF-TOKEN"];
         delete api.defaults.headers.common["X-XSRF-TOKEN"];
         delete api.defaults.headers.common["X-CSRFToken"];

         setUser(null);
         setLoading(false);
      }
   }, [api]);

   /**
    * Changes the current user's password.
    * Requires the current password for verification.
    *
    * @param {string} currentPassword - User's current password
    * @param {string} newPassword - User's desired new password
    * @returns {Promise<{success: boolean, message?: string, error?: string}>}
    */
   const changePassword = useCallback(
      async (currentPassword, newPassword) => {
         try {
            const res = await api.post("/change-password", {
               current_password: currentPassword,
               new_password: newPassword,
            });

            return {
               success: true,
               message: res.data?.message || "Password changed successfully",
            };
         } catch (err) {
            const errorMessage = err.response?.data?.error || "Password change failed";
            console.error("❌ Password change failed:", errorMessage);
            return { success: false, error: errorMessage };
         }
      },
      [api]
   );

   // ============================================================================
   // CONTEXT VALUE
   // ============================================================================

   /**
    * Memoized context value to prevent unnecessary re-renders.
    * Contains all auth state and operations.
    */
   const value = useMemo(
      () => ({
         // State
         user, // Current user object or null
         loading, // Loading state for async operations
         isInitialized, // Whether auth system has initialized

         // Operations
         login, // Log in with email/password
         register, // Create new account
         logout, // Log out current user
         changePassword, // Change password
         refreshUser, // Manually refresh user data
         refreshAccessToken, // Manually refresh access token
      }),
      [user, loading, isInitialized, login, register, logout, changePassword, refreshUser, refreshAccessToken]
   );

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
