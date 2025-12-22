import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../hooks/useApi";

export const NcaaaCoursesContext = createContext();

export const NcaaaCoursesContextProvider = ({ children }) => {
   const api = useApi();

   const fetchNcaaCourses = async () => {
      const response = await api.get("/ncaaa");
      if (response.data.success) {
         return response.data.courses;
      } else {
         throw new Error(response.data.error || "Failed to fetch courses");
      }
   };

   const { isLoading, data, error } = useQuery({
      queryKey: ["ncaaa"],
      queryFn: fetchNcaaCourses,
   });

   const value = {
      ncaaCourses: data,
      isLoading,
      error,
   };

   return <NcaaaCoursesContext.Provider value={value}>{children}</NcaaaCoursesContext.Provider>;
};
