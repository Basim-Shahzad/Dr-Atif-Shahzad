import { useEffect, useRef, useState } from "react";
import { useResearch } from "../hooks/useResearch";
import { HiArrowLeftCircle } from "react-icons/hi2";

const BASE_SPEED = 4; // faster than before
const MAX_SPEED = 6;
const FRICTION = 0.95; // wheel slowdown 0.95 default
const HOVER_DAMPING = 0.88; // smooth stop on hover

const Hero = () => {
   const { researches = [] } = useResearch();
   const trackRef = useRef(null);
   const speedRef = useRef(BASE_SPEED);
   const posRef = useRef(0);
   const hoveringRef = useRef(false);

   // 🔁 animation loop
   useEffect(() => {
      let rafId;

      const animate = () => {
         if (!trackRef.current) return;

         // Smooth hover slowdown
         if (hoveringRef.current) {
            speedRef.current *= HOVER_DAMPING;
         } else {
            // Return to base speed smoothly
            speedRef.current += (BASE_SPEED - speedRef.current) * 0.04;
         }

         speedRef.current *= FRICTION;

         posRef.current -= speedRef.current;

         // Infinite loop reset
         const width = trackRef.current.scrollWidth / 2;
         if (Math.abs(posRef.current) >= width) {
            posRef.current = 0;
         }

         trackRef.current.style.transform = `translateX(${posRef.current}px)`;
         rafId = requestAnimationFrame(animate);
      };

      rafId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(rafId);
   }, []);

   // 🖱️ mouse wheel acceleration
   useEffect(() => {
      const onWheel = (e) => {
         speedRef.current += Math.abs(e.deltaY) * 0.02;
         speedRef.current = Math.min(speedRef.current, MAX_SPEED);
      };

      window.addEventListener("wheel", onWheel, { passive: true });
      return () => window.removeEventListener("wheel", onWheel);
   }, []);

   const items = [...researches, ...researches];

   return (
      <div className="grid grid-rows-3 h-[675px]">
         <div className="bg-blue-500" />
         <div className="bg-green-500" />

         <div className="overflow-hidden">
            <div className="text-4xl mx-2 my-2 text-black font-semibold z-50">Researches</div>
            <div ref={trackRef} className="flex gap-3 w-max">
               {items.map((research, i) => (
                  <div
                     key={`${research.put_code}-${i}`}
                     className="card"
                     onMouseEnter={() => (hoveringRef.current = true)}
                     onMouseLeave={() => (hoveringRef.current = false)}>
                     <div className="text-sm">
                        {research?.title}
                        <button>go</button>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
};

export default Hero;