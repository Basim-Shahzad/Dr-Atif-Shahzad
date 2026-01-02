import { ResearchContext } from "../Context/ResearchContext";
import { useContext } from "react";

export const useResearch = () => {
   const context = useContext(ResearchContext);
   if (!context) throw new Error("useResearchContext must be used within ResearchContextProvider");
   return context;
};