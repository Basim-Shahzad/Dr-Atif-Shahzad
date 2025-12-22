import { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { useNcaaa } from "../../hooks/useNcaaa";

const NCAAA_CourseList = () => {
   const { ncaaCourses, isLoading, error } = useNcaaa();

   if (isLoading)
      return (
         <div className="flex items-center justify-center gap-2">
            <CircularProgress size={20} />
            <span>Loading courses...</span>
         </div>
      );

   if (error)
      return (
         <div className="text-red-600 text-center">
            Error: Failed to fetch courses
         </div>
      );

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
         {ncaaCourses.map((course) => (
            <div
               className="card w-96 min-h-max overflow-hidden bg-green-200 flex flex-col p-4 cursor-pointer transition-all duration-200 hover:bg-green-300 rounded-xl"
               key={course.course_id}>
               <h1 className="text-xl text-green-800 font-black">{course.course_code}</h1>
               <h2 className="text-2xl text-green-700 font-medium">{course.course_name}</h2>
               <h3 className="text-green-700 bg-green-300 w-max px-1.5 rounded-full mt-2.5">
                  {course.course_type || "🌀core"}
               </h3>
               <button className="text-lg cursor-pointer text-white font-normal w-1/2 py-1 px-2 rounded-lg hover:bg-green-800 bg-green-700 transition-all duration-200 mt-5">
                  Add Course Data
               </button>
            </div>
         ))}
      </div>
   );
};

export default NCAAA_CourseList;
