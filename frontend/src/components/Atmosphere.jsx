import React from 'react';
import { motion } from 'framer-motion';

const Atmosphere = () => {
  const molecules = Array.from({ length: 45 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 20,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.3 + 0.1,
    color: i % 3 === 0 ? '#10b981' : i % 3 === 1 ? '#06b6d4' : '#6366f1'
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
      {molecules.map((m) => (
        <motion.div key={m.id} className="absolute rounded-full"
          style={{ width: m.size, height: m.size, backgroundColor: m.color, boxShadow: `0 0 10px ${m.color}80`, left: `${m.x}%`, top: `${m.y}%`, opacity: m.opacity }}
          animate={{ y: [0, -100, 0, 100, 0], x: [0, 50, 0, -50, 0], scale: [1, 1.2, 1, 0.8, 1], opacity: [m.opacity, m.opacity * 0.5, m.opacity] }}
          transition={{ duration: m.duration, repeat: Infinity, delay: m.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
};

export default Atmosphere;
