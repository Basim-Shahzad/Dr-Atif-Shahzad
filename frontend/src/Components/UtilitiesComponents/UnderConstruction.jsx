import React from "react";
import { useNavigate } from "react-router-dom";

const UnderConstruction = () => {
   const navigate = useNavigate();

   return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
         <div className="max-w-md w-full text-center border border-amber-300 bg-amber-50 rounded-xl p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-amber-800 mb-3">🚧 Page Under Construction</h1>

            <p className="text-sm text-amber-700 mb-6">
               This section is currently being worked on.
               <br />
               Please check back later.
            </p>

            <button
               onClick={() => navigate("/")}
               className="
            inline-flex items-center justify-center
            bg-amber-700 text-white font-semibold
            px-6 py-2 rounded-lg
            hover:bg-amber-600
            transition
          ">
               Go Back Home
            </button>
         </div>
      </div>
   );
};

export default UnderConstruction;
