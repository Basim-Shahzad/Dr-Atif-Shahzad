import { useEffect, useRef, useState } from "react";
import { useResearch } from "../hooks/useResearch";
import {
   HiArrowTopRightOnSquare,
   HiAcademicCap,
   HiBeaker,
   HiCircleStack,
   HiAdjustmentsHorizontal,
} from "react-icons/hi2";
import { motion } from "framer-motion";

const BASE_SPEED = 1.0;
const MAX_SPEED = 8.0;
const FRICTION = 0.94;

const Hero = () => {
   const { researches = [] } = useResearch();
   const trackRef = useRef(null);
   const speedRef = useRef(BASE_SPEED);
   const posRef = useRef(0);
   const hoveringRef = useRef(false);
   const scrollingRef = useRef(false);
   const containerRef = useRef(null);

   const [isMobile, setIsMobile] = useState(false);

   // Check for mobile to disable dragging
   useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 1024);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
   }, []);

   // 🔁 Infinite Animation Loop
   useEffect(() => {
      let rafId;
      const animate = () => {
         if (!trackRef.current) return;

         // Speed up ONLY when BOTH hovering AND scrolling at the same time
         if (hoveringRef.current && scrollingRef.current) {
            speedRef.current += (MAX_SPEED - speedRef.current) * 0.12;
         } else {
            // Immediately return to base speed if not both conditions met
            speedRef.current = BASE_SPEED;
         }

         speedRef.current *= FRICTION;
         posRef.current -= speedRef.current;

         const width = trackRef.current.scrollWidth / 2;
         if (Math.abs(posRef.current) >= width) posRef.current = 0;

         trackRef.current.style.transform = `translateX(${posRef.current}px)`;
         rafId = requestAnimationFrame(animate);
      };
      rafId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(rafId);
   }, []);

   // 🖱️ Scroll Handler - Activate speed boost
   useEffect(() => {
      let scrollTimeout;
      const handleWheel = (e) => {
         scrollingRef.current = true;
         speedRef.current += Math.abs(e.deltaY) * 0.05;
         speedRef.current = Math.min(speedRef.current, MAX_SPEED);

         // Clear existing timeout
         if (scrollTimeout) clearTimeout(scrollTimeout);

         // Set scrolling to false after user stops scrolling
         scrollTimeout = setTimeout(() => {
            scrollingRef.current = false;
         }, 150);
      };

      window.addEventListener("wheel", handleWheel, { passive: true });
      return () => {
         window.removeEventListener("wheel", handleWheel);
         if (scrollTimeout) clearTimeout(scrollTimeout);
      };
   }, []);

   // 2x2 Grid Layout for Draggable Cards
   const categories = [
      {
         icon: HiBeaker,
         title: "Research",
         subtitle: "& Development",
         desc: "Cutting-edge research initiatives",
      },
      {
         icon: HiAcademicCap,
         title: "Learning",
         subtitle: "Pathways",
         desc: "Comprehensive online courses",
      },
      {
         icon: HiAdjustmentsHorizontal,
         title: "Technology",
         subtitle: "Solutions",
         desc: "Industry-leading platforms",
      },
      {
         icon: HiCircleStack,
         title: "Knowledge",
         subtitle: "Base",
         desc: "Expert insights and resources",
      },
   ];

   const items = [...researches, ...researches];

   return (
      <div className="h-[calc(100vh-88px)] w-full bg-[#f8faf8] overflow-hidden flex flex-col font-sans select-none">
         {/* TOP: Draggable Playground (55% Height) */}
         <div
            className="h-[55%] relative border-b border-green-100 p-4 sm:p-8 flex flex-col items-start justify-center"
            ref={containerRef}>
            {/* Left Section - Text Content */}
            <div className="z-10 max-w-2xl px-4 sm:px-0">
               <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-4 sm:mb-6">
                  <HiBeaker className="text-base sm:text-lg flex-shrink-0" />
                  <span>Explore & Discover</span>
               </div>
               <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[0.95] uppercase tracking-tight max-w-3xl">
                  The Future of
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">
                     Education & Innovation
                  </span>
               </h1>
               <p className="text-xs sm:text-sm text-slate-600 mt-4 sm:mt-6 max-w-lg font-medium leading-relaxed">
                  Discover world-class research, expert-led courses, and transformative learning experiences designed to
                  elevate your knowledge and skills.
               </p>
            </div>

            {/* 2x2 Grid of Draggable Cards - Hidden on Mobile */}
            {!isMobile && (
               <div className="absolute top-1/2 right-12 lg:right-20 -translate-y-1/2 w-96 h-80">
                  {categories.map((cat, i) => {
                     const Icon = cat.icon;
                     const row = Math.floor(i / 2);
                     const col = i % 2;

                     return (
                        <motion.div
                           key={i}
                           drag
                           dragConstraints={{
                              left: -25,
                              right: 25,
                              top: -25,
                              bottom: 25,
                           }}
                           dragElastic={0.1}
                           dragFriction={0.5}
                           whileHover={{ scale: 1.05 }}
                           whileDrag={{ scale: 1.1, zIndex: 50 }}
                           className="absolute w-44 p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-lg hover:shadow-xl cursor-grab active:cursor-grabbing transition-shadow"
                           style={{
                              left: `${col * 200}px`,
                              top: `${row * 160}px`,
                           }}>
                           <Icon className="text-emerald-600 mb-2 text-2xl" />
                           <h2 className="text-sm font-black text-slate-800 leading-tight uppercase">{cat.title}</h2>
                           <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-tight mt-1">
                              {cat.subtitle}
                           </h3>
                           <p className="text-[9px] text-slate-500 mt-2 font-medium">{cat.desc}</p>
                        </motion.div>
                     );
                  })}
               </div>
            )}
         </div>

         {/* BOTTOM: Professional Feed (45% Height) */}
         <div className="flex-1 bg-white flex flex-col min-h-0 relative overflow-hidden">
            {/* Header for the Feed */}
            <div className="px-6 sm:px-10 pt-3 sm:pt-4 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 flex-shrink-0">
               <div className="flex items-center gap-3 sm:gap-4">
                  <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">
                     Featured Researches
                  </h3>
                  <div className="h-[2px] w-8 sm:w-12 bg-emerald-500" />
               </div>
               <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Hover + Scroll to accelerate • Explore at your pace
               </div>
            </div>

            {/* Horizontal Track - No Scrollbar */}
            <div className="flex-1 flex items-center overflow-hidden">
               <div ref={trackRef} className="flex gap-4 sm:gap-6 px-6 sm:px-10 whitespace-nowrap">
                  {items.map((res, i) => (
                     <div
                        key={i}
                        onMouseEnter={() => (hoveringRef.current = true)}
                        onMouseLeave={() => (hoveringRef.current = false)}
                        className="w-[420px] sm:w-[480px] h-[180px] sm:h-[200px] shrink-0 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 rounded-[2rem] p-4 sm:p-5 flex flex-col justify-between transition-all duration-500 hover:from-emerald-50 hover:to-green-50 hover:border-emerald-300 hover:shadow-lg group relative overflow-hidden">
                        {/* Background Ornament */}
                        <HiAcademicCap className="absolute -right-6 -top-6 text-9xl text-slate-200/15 group-hover:text-emerald-200/25 transition-colors duration-500" />

                        {/* Content */}
                        <div className="relative z-10">
                           <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 flex-wrap">
                              <span className="bg-gradient-to-r from-emerald-600 to-green-500 text-white text-[8px] sm:text-[9px] font-black px-2.5 py-0.5 rounded-full flex-shrink-0">
                                 {res.year || "2024"}
                              </span>
                              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[200px] sm:max-w-[250px]">
                                 {res.journal || "Premium Content"}
                              </span>
                           </div>

                           <h4 className="text-sm sm:text-base font-bold text-slate-800 whitespace-normal line-clamp-2 leading-snug group-hover:text-emerald-900 transition-colors duration-300">
                              {res.title || "Discover More"}
                           </h4>
                        </div>

                        {/* Footer */}
                        <div className="relative z-10 flex items-center justify-between mt-2 sm:mt-3">
                           <div className="text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              ID: {res.doi || "—"}
                           </div>
                           <a
                              href={res.url || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-white p-2 sm:p-2.5 rounded-full text-emerald-600 shadow-sm border border-slate-100 hover:bg-emerald-600 hover:text-white hover:shadow-md transition-all duration-300 transform hover:scale-110 hover:rotate-12 flex-shrink-0">
                              <HiArrowTopRightOnSquare size={16} className="sm:w-4 sm:h-4" />
                           </a>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
};

export default Hero;
