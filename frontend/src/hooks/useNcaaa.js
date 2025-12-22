import { useContext } from "react";
import { NcaaaCoursesContext  } from "../Context/NcaaCourseContext";

export const useNcaaa = () => {
   const context = useContext(NcaaaCoursesContext);
   if (!context) {
      throw new Error("useNcaaa must be used within NcaaaCoursesContextProvider");
   }
   return context;
};