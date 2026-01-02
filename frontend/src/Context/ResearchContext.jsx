import { createContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";

export const ResearchContext = createContext();

export const ResearchContextProvider = ({ children }) => {
   let api = useApi();
   const { isInitialized } = useAuth();

   const fetchResearches = async () => {
      const response = await api.get("/orcid/researches");
      if (response.data.success) {
         console.log(response.data.researches)
         return response.data.researches;
      } else {
         console.error(response.data.error);
      }
   };

   const { isLoading, data, error } = useQuery({
      queryKey: ["researches"],
      queryFn: fetchResearches,
      enabled: isInitialized,
   });


   const value = {
      researches: data ?? [],
      isLoading,
      error,
   };

   return <ResearchContext.Provider value={value}>{children}</ResearchContext.Provider>;
};
