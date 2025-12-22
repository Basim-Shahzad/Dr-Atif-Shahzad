import { createContext, useState, useEffect, useMemo, useCallback } from "react";
import { useApi } from "../hooks/useApi";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
   const api = useApi();

   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);
   const [isInitialized, setIsInitialized] = useState(false);

   // Add 401 interceptor to the api instance
   useEffect(() => {
      const interceptor = api.interceptors.response.use(
         (response) => response,
         (error) => {
            // Handle 401 globally - clear user state
            if (error.response?.status === 401) {
               setUser(null);
            }
            return Promise.reject(error);
         }
      );

      // Cleanup interceptor on unmount
      return () => {
         api.interceptors.response.eject(interceptor);
      };
   }, [api]);

   // Fetch CSRF token from server
   const fetchCsrfToken = useCallback(async () => {
      try {
         const res = await api.get("/csrf-token");
         const token = res?.data?.csrfToken;

         if (token) {
            // Set multiple header variants for compatibility
            api.defaults.headers.common["X-CSRF-TOKEN"] = token;
            api.defaults.headers.common["X-XSRF-TOKEN"] = token;
            api.defaults.headers.common["X-CSRFToken"] = token;
         }

         return token;
      } catch (err) {
         console.warn("Failed to fetch CSRF token:", err.message);
         return null;
      }
   }, [api]);

   // Fetch current authenticated user
   const fetchCurrentUser = useCallback(async () => {
      try {
         const res = await api.get("/me");
         setUser(res.data?.user || null);
      } catch (err) {
         if (err.response?.status !== 401) {
            console.error("Failed to fetch current user:", err.message);
         }
         setUser(null);
      }
   }, [api]);

   // Initialize auth state on mount
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

   // Login function
   const login = useCallback(
      async (email, password) => {
         try {
            setLoading(true);
            const res = await api.post("/login", { email, password });

            if (res.data?.user) {
               setUser(res.data.user);
               await fetchCsrfToken(); // Refresh token after login
               return { success: true, user: res.data.user };
            }

            return { success: false, error: "Invalid response from server" };
         } catch (err) {
            const errorMessage =
               err.response?.data?.error ||
               err.response?.data?.message ||
               (err.response ? `Login failed (${err.response.status})` : "Login failed. Please try again.");

            return { success: false, error: errorMessage };
         } finally {
            setLoading(false);
         }
      },
      [api, fetchCsrfToken]
   );

   // Register function
   const register = useCallback(
      async (userData) => {
         try {
            setLoading(true);
            const res = await api.post("/register", userData);

            if (res.data?.user) {
               setUser(res.data.user);
               await fetchCsrfToken();
               return { success: true, user: res.data.user };
            }

            return { success: false, error: "Registration failed" };
         } catch (err) {
            const errorMessage = err.response?.data?.error || "Registration failed";
            return { success: false, error: errorMessage };
         } finally {
            setLoading(false);
         }
      },
      [api, fetchCsrfToken]
   );

   // Logout function
   const logout = useCallback(async () => {
      try {
         setLoading(true);
         await api.post("/logout");
      } catch (err) {
         console.error("Logout error:", err.message);
      } finally {
         setUser(null);
         setLoading(false);
      }
   }, [api]);

   // Change password function
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
            return { success: false, error: errorMessage };
         }
      },
      [api]
   );

   // Refresh user data
   const refreshUser = useCallback(async () => {
      await fetchCurrentUser();
   }, [fetchCurrentUser]);

   // Context value
   const value = useMemo(
      () => ({
         user,
         loading,
         isInitialized,
         login,
         register,
         logout,
         changePassword,
         refreshUser,
      }),
      [user, loading, isInitialized, login, register, logout, changePassword, refreshUser]
   );

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
