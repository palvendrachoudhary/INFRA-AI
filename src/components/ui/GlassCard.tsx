import React from 'react';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "green" | "cyan" | "red" | "none";
  onClick?: () => void;
  hoverEffect?: boolean;
}

export function GlassCard({ children, className = '', glowColor = "none", onClick, hoverEffect = true }: GlassCardProps) {
  const glowStyles = {
    green: "hover:border-neon-green/40 hover:shadow-[0_0_25px_-5px_rgba(0,255,135,0.3)]",
    cyan: "hover:border-cyan-glow/40 hover:shadow-[0_0_25px_-5px_rgba(0,229,255,0.3)]",
    red: "hover:border-alert-red/40 hover:shadow-[0_0_25px_-5px_rgba(255,59,48,0.3)]",
    none: "hover:border-white/20",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverEffect ? { y: -3 } : {}}
      onClick={onClick}
      className={`bg-[#121216]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 ${
        hoverEffect ? glowStyles[glowColor] : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}
