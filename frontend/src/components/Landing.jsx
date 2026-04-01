import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Globe, Activity, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

const AnimatedBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        
        {/* 3D Glowing Earth Animation */}
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] scale-[0.6] sm:scale-75 md:scale-100 flex items-center justify-center">
            
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-[#0ea5e9]/10 rounded-full blur-[100px] mix-blend-screen" />
            <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-[80px] mix-blend-screen" />

            {/* Outer Slow Moving Orbits */}
            <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
                className="absolute w-[800px] h-[800px] rounded-full border border-dashed border-cyan-800/20"
            />
            <motion.div 
                animate={{ rotate: -360 }} 
                transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
                className="absolute w-[1000px] h-[1000px] rounded-[48%] border border-sky-800/10 border-l-[#0ea5e9]/20"
            />

            {/* Earth Core Container */}
            <div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-20deg) rotateZ(15deg)' }}>
                <motion.div 
                    animate={{ rotateY: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="w-full h-full relative"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Longitudes */}
                    {[0, 30, 60, 90, 120, 150].map((deg) => (
                        <div key={deg} className="absolute inset-0 border border-[#0ea5e9]/30 rounded-full" style={{ transform: `rotateY(${deg}deg)` }} />
                    ))}
                    
                    {/* Latitudes */}
                    {[{ z: 100, s: 0.942 }, { z: 180, s: 0.8 }, { z: 240, s: 0.6 }, { z: 280, s: 0.359 }].map((lat, i) => (
                        <React.Fragment key={i}>
                            <div className="absolute inset-0 border border-[#0ea5e9]/30 rounded-full" style={{ transform: `rotateX(90deg) translateZ(${lat.z}px) scale(${lat.s})` }} />
                            <div className="absolute inset-0 border border-[#0ea5e9]/30 rounded-full" style={{ transform: `rotateX(90deg) translateZ(-${lat.z}px) scale(${lat.s})` }} />
                        </React.Fragment>
                    ))}
                    
                    {/* Equator & Core */}
                    <div className="absolute inset-0 border-[2px] border-[#0ea5e9]/40 rounded-full shadow-[0_0_30px_rgba(14,165,233,0.4)]" style={{ transform: `rotateX(90deg) translateZ(0px)` }} />
                </motion.div>
            </div>
        </div>

        {/* 15 Highly Visible Floating Data Particles */}
        {[...Array(20)].map((_, i) => (
            <motion.div 
               key={i}
               animate={{ y: [0, -150 - (Math.random()*200), 0], x: [0, Math.random()*100 - 50, 0], opacity: [0.1, 0.8, 0.1] }} 
               transition={{ duration: 8 + (Math.random() * 10), repeat: Infinity, ease: "easeInOut", delay: Math.random() * 5 }} 
               className="absolute rounded-full bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]"
               style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${2 + Math.random() * 4}px`,
                  height: `${2 + Math.random() * 4}px`
               }}
            />
        ))}
    </div>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#030914] text-white flex flex-col items-center justify-center relative font-sans overflow-x-hidden pt-12 pb-24 selection:bg-[#0ea5e9]/30">
      
      <AnimatedBackground />

      <main className="z-10 w-full max-w-[1000px] flex flex-col items-center px-4 mt-4">
        
        {/* Top Pill - Perfectly sized */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex items-center gap-2 border border-[#0c3149] bg-[#040c18] px-5 py-[6px] rounded-full mb-10 shadow-[0_0_15px_rgba(14,165,233,0.05)] mt-4">
          <Zap className="w-3.5 h-3.5 text-[#0ea5e9] -ml-1 opacity-80" />
          <span className="text-[#0ea5e9] text-[9.5px] font-black tracking-[0.2em] uppercase opacity-90">AI-POWERED GREENHOUSE GAS FORECASTING</span>
        </motion.div>

        {/* Title - Scaled down exactly to reference image ratios */}
        <motion.h1 initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-center font-black leading-[1.1] mb-8 flex flex-col items-center">
          <span className="text-5xl md:text-7xl tracking-tight">
            <span className="text-slate-100">Global </span>
            <span className="text-[#0ea5e9]">GHG Emissions</span>
          </span>
          <span className="text-4xl md:text-[3.8rem] text-[#1e3a5f] mt-1 tracking-tight">
            Intelligence System
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-[#1a4b6c] text-[14px] md:text-[15px] font-medium text-center max-w-2xl mb-12 leading-relaxed tracking-wide">
          Predict and analyze greenhouse gas emissions — <span className="text-[#1e5881]">CO₂, CH₄, N₂O</span> — across nations<br className="hidden md:block"/>
          with <span className="text-[#0ea5e9] font-bold">machine learning precision</span> and <span className="text-[#0ea5e9] font-bold">real-world data.</span>
        </motion.p>

        {/* Molecule Buttons */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }} className="flex items-center gap-4 sm:gap-6 mb-20">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} title="CO₂ (Carbon Dioxide)" className="border border-sky-900/60 bg-[#061022] px-8 py-[10px] rounded-full text-[#0ea5e9] font-bold text-xs tracking-widest transition-all hover:bg-[#0ea5e9]/10 hover:shadow-[0_0_20px_rgba(14,165,233,0.2)] hover:border-[#0ea5e9]/50 min-w-[90px] cursor-default">
            CO₂
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} title="CH₄ (Methane)" className="border border-emerald-900/60 bg-[#061022] px-8 py-[10px] rounded-full text-emerald-400 font-bold text-xs tracking-widest transition-all hover:bg-emerald-400/10 hover:shadow-[0_0_20px_rgba(52,211,153,0.2)] hover:border-emerald-400/50 min-w-[90px] cursor-default">
            CH₄
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} title="N₂O (Nitrous Oxide)" className="border border-indigo-900/60 bg-[#061022] px-8 py-[10px] rounded-full text-indigo-400 font-bold text-xs tracking-widest transition-all hover:bg-indigo-400/10 hover:shadow-[0_0_20px_rgba(129,140,248,0.2)] hover:border-indigo-400/50 min-w-[90px] cursor-default">
            N₂O
          </motion.button>
        </motion.div>

        {/* Features Grid with 3D Hover Effects */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-2 relative z-20 mb-20 md:mb-24 perspective-[1000px]">
          
          <motion.div whileHover={{ scale: 1.03, y: -8, rotateX: 2, rotateY: -2, boxShadow: "0 25px 50px -12px rgba(14, 165, 233, 0.15)" }} className="bg-gradient-to-b from-[#050c18] to-[#030710] border border-sky-900/20 rounded-[28px] p-8 transition-colors text-left shadow-2xl hover:border-sky-900/50 group cursor-pointer">
            <div className="w-[45px] h-[45px] rounded-xl border border-sky-900/40 bg-[#081326] flex items-center justify-center mb-6 group-hover:bg-[#0a1b35] transition-colors relative overflow-hidden">
              <div className="absolute inset-0 bg-[#0ea5e9]/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
              <Globe className="w-[18px] h-[18px] text-[#0ea5e9] relative z-10" />
            </div>
            <h3 className="text-[17px] font-black tracking-wide mb-3 text-white">Emission Tracking</h3>
            <p className="text-[#1a4b6c] leading-[1.8] text-[13px] font-medium">
              Monitor CO₂, CH₄ and N₂O across 200+ countries with historical data from 1990 — clean FAO datasets.
            </p>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.03, y: -8, boxShadow: "0 25px 50px -12px rgba(14, 165, 233, 0.15)" }} className="bg-gradient-to-b from-[#050c18] to-[#030710] border border-sky-900/20 rounded-[28px] p-8 transition-colors text-left shadow-2xl hover:border-sky-900/50 group cursor-pointer">
            <div className="w-[45px] h-[45px] rounded-xl border border-sky-900/40 bg-[#081326] flex items-center justify-center mb-6 group-hover:bg-[#0a1b35] transition-colors relative overflow-hidden">
              <div className="absolute inset-0 bg-[#0ea5e9]/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
              <Activity className="w-[18px] h-[18px] text-[#0ea5e9] relative z-10" />
            </div>
            <h3 className="text-[17px] font-black tracking-wide mb-3 text-white">AI Forecasting</h3>
            <p className="text-[#1a4b6c] leading-[1.8] text-[13px] font-medium">
              99.3% R² accuracy with a Random Forest model trained on real emission records — projections to 2031.
            </p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03, y: -8, rotateX: 2, rotateY: 2, boxShadow: "0 25px 50px -12px rgba(14, 165, 233, 0.15)" }} className="bg-gradient-to-b from-[#050c18] to-[#030710] border border-sky-900/20 rounded-[28px] p-8 transition-colors text-left shadow-2xl hover:border-sky-900/50 group cursor-pointer">
            <div className="w-[45px] h-[45px] rounded-xl border border-sky-900/40 bg-[#081326] flex items-center justify-center mb-6 group-hover:bg-[#0a1b35] transition-colors relative overflow-hidden">
              <div className="absolute inset-0 bg-[#0ea5e9]/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
              <ShieldCheck className="w-[20px] h-[20px] text-[#0ea5e9] relative z-10" />
            </div>
            <h3 className="text-[17px] font-black tracking-wide mb-3 text-white">Threat Assessment</h3>
            <p className="text-[#1a4b6c] leading-[1.8] text-[13px] font-medium">
              Automatic Low / Medium / High classification powered by ML, with targeted mitigation strategies.
            </p>
          </motion.div>

        </motion.div>

        {/* Launch Console Button & Footer Stats */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 1 }} className="flex flex-col items-center w-full relative z-20 mx-auto">
           <Link to="/predict">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-slate-900 font-extrabold px-10 py-[18px] rounded-2xl flex items-center gap-4 text-[11px] tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_50px_rgba(14,165,233,0.5)] mb-14 min-w-[320px] justify-center border border-cyan-400">
                 LAUNCH EMISSIONS CONSOLE <ArrowRight size={18} strokeWidth={3} className="opacity-90" />
              </motion.button>
           </Link>

           {/* Stats Footer underneath */}
           <div className="flex flex-row flex-wrap justify-center gap-8 sm:gap-20 text-center mt-2 px-6">
               <div className="flex flex-col items-center">
                   <p className="text-[26px] font-black text-[#0ea5e9] tracking-tight">99.3%</p>
                   <p className="text-[9px] font-bold text-slate-600 tracking-[0.2em] mt-2 uppercase">Model R² Score</p>
               </div>
               <div className="flex flex-col items-center">
                   <p className="text-[26px] font-black text-[#0ea5e9] tracking-tight">200+</p>
                   <p className="text-[9px] font-bold text-slate-600 tracking-[0.2em] mt-2 uppercase">Countries Covered</p>
               </div>
               <div className="flex flex-col items-center">
                   <p className="text-[26px] font-black text-[#0ea5e9] tracking-tight flex items-baseline gap-1">35 <span className="text-[14px] font-bold opacity-80 mt-1 block">yrs</span></p>
                   <p className="text-[9px] font-bold text-slate-600 tracking-[0.2em] mt-2 uppercase">Years of Data</p>
               </div>
               <div className="flex flex-col items-center hidden sm:flex">
                   <p className="text-[26px] font-black text-[#0ea5e9] tracking-tight">3</p>
                   <p className="text-[9px] font-bold text-slate-600 tracking-[0.2em] mt-2 uppercase">Gas Types</p>
               </div>
           </div>
        </motion.div>

      </main>
    </div>
  );
};

export default Landing;
