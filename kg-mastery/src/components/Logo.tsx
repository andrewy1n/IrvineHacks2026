import { motion } from "motion/react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
    "2xl": "w-32 h-32",
    "3xl": "w-40 h-40",
    "4xl": "w-48 h-48",
  };

  return (
    <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
      {/* Robot Body Sphere */}
      <motion.div 
        className="relative w-[85%] h-[85%] rounded-full overflow-hidden flex items-center justify-center shadow-[inset_0_-8px_20px_rgba(0,0,0,0.9),_0_0_20px_rgba(30,58,138,0.3)] border border-white/5"
        style={{
          background: "radial-gradient(circle at 60% 30%, #475569 0%, #1e3a8a 20%, #1e1b4b 50%, #000000 80%, #000 100%)",
        }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Animated surface swirling texture */}
        <motion.div 
          className="absolute inset-[-50%] opacity-30 mix-blend-overlay"
          style={{
            background: "radial-gradient(ellipse at center, transparent 0%, rgba(125,211,252,0.4) 50%, transparent 100%)",
            filter: "blur(4px)"
          }}
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        {/* Top Glare (Glass Sphere Reflection) */}
        <div className="absolute top-[5%] right-[15%] w-[40%] h-[30%] bg-gradient-to-b from-white/40 to-transparent rounded-[50%] blur-[1px] rotate-[-20deg]" />
        
        {/* Left Side Ambient Glare */}
        <div className="absolute top-[20%] left-[-5%] w-[30%] h-[60%] bg-gradient-to-r from-blue-300/10 to-transparent rounded-[50%] blur-[2px] opacity-70" />

        {/* Left Eye */}
        <div className="absolute left-[20%] top-[45%] w-[12%] h-[28%] bg-white/90 rounded-full shadow-[0_0_12px_4px_rgba(255,255,255,0.8)]" />

        {/* Right Eye */}
        <div className="absolute left-[40%] top-[45%] w-[12%] h-[28%] bg-white/90 rounded-full shadow-[0_0_12px_4px_rgba(255,255,255,0.8)]" />

      </motion.div>
    </div>
  );
}
