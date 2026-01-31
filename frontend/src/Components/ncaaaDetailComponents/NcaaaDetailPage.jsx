import React, { useState } from "react";
import { useParams } from "react-router";
import NcaaaStudentResults from "./NcaaaFormTables/NcaaaStudentResults";
import UnderConstruction from "../UtilitiesComponents/UnderConstruction";

const NcaaaDetailPage = () => {
   const [activeTab, setActiveTab] = useState("student-results");

   return (
      <div className="px-24 mt-8">
         <div className="flex">
            <button
               className={`${
                  activeTab === "student-results" ? "font-bold bg-green-700 text-white" : ""
               } px-3 py-1.5 border border-green-700 cursor-pointer`}
               onClick={() => setActiveTab("student-results")}>
               Student Results
            </button>

            <button
               className={`${
                  activeTab === "course-learning-outcomes" ? "font-bold bg-green-700 text-white" : ""
               } px-2 py-2 border border-green-700 cursor-pointer`}
               onClick={() => setActiveTab("course-learning-outcomes")}>
               Course Learning Outcomes
            </button>

            <button
               className={`${
                  activeTab === "topics-not-covered" ? "font-bold bg-green-700 text-white" : ""
               } px-2 py-2 border border-green-700 cursor-pointer`}
               onClick={() => setActiveTab("topics-not-covered")}>
               Topics not Covered
            </button>
         </div>

         {activeTab === "student-results" && (
            <div className="mt-8">
               <NcaaaStudentResults />
            </div>
         )}
         {activeTab === "course-learning-outcomes" && <UnderConstruction />}
         {activeTab === "topics-not-covered" && <UnderConstruction />}
      </div>
   );
};

export default NcaaaDetailPage;
