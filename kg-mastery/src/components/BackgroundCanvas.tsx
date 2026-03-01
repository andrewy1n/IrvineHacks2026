import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";
import Spline from "@splinetool/react-spline";
import { motion } from "motion/react";
import GLBSpaceshipCanvas from "./GLBSpaceship";

export default function BackgroundCanvas() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div className="absolute inset-0 h-full w-full pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Spline Background */}
      <div className="absolute inset-0 w-full h-full">
        <Spline scene="/assets/black_hole_animation.spline" />
      </div>

      {/* 3D GLB Spaceship */}
      <div className="absolute bottom-10 -left-40 w-[600px] h-[600px] pointer-events-none z-10 opacity-80">
        <GLBSpaceshipCanvas />
      </div>

      {/* Bear Space Station */}
      <motion.div
        className="absolute bottom-20 right-20 w-64 h-64 pointer-events-none z-10 opacity-70"
        animate={{
          y: [0, -15, 0],
          x: [0, 10, 0],
          rotate: [-2, 2, -2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg viewBox="0 0 300 350" className="w-full h-full overflow-visible">
          <defs>
            <radialGradient id="bear-fire" cx="50%" cy="0%" r="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="rgba(45,212,191,0.6)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            
            <clipPath id="bear-clip">
              {/* Crop out any lower ground/noise to focus on the bear */}
              <polygon points="0,0 300,0 300,280 200,300 150,290 100,300 0,280" />
            </clipPath>
          </defs>

          {/* Rocket Thrusters */}
          <motion.path
            fill="url(#bear-fire)"
            animate={{
              d: [
                "M 120,290 Q 150,380 180,290 Q 160,280 150,280 Q 140,280 120,290 Z",
                "M 120,290 Q 150,350 180,290 Q 160,280 150,280 Q 140,280 120,290 Z",
                "M 120,290 Q 150,400 180,290 Q 160,280 150,280 Q 140,280 120,290 Z"
              ]
            }}
            transition={{ duration: 0.1, repeat: Infinity, repeatType: "mirror" }}
            style={{ filter: "blur(4px)", mixBlendMode: "screen" }}
          />

          {/* Bear Image */}
          <image 
            href="/assets/bear_art.png" 
            x="0" y="0" width="300" height="300" 
            preserveAspectRatio="xMidYMid slice"
            style={{ 
              filter: "contrast(1.5) drop-shadow(0 0 15px rgba(255,255,255,0.4))", 
              mixBlendMode: "screen" 
            }}
            clipPath="url(#bear-clip)"
          />
        </svg>
      </motion.div>

      {/* Constellation Particles */}
      <Particles
        id="tsparticles-bg"
        init={particlesInit}
        className="absolute inset-0 h-full w-full"
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 120,
          interactivity: {
            events: { onHover: { enable: true, mode: "grab" } },
            modes: {
              grab: { distance: 140, links: { opacity: 0.5 } },
            },
          },
          particles: {
            color: { value: "#ffffff" },
            links: {
              color: "#ffffff",
              distance: 150,
              enable: true,
              opacity: 0.2,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: { default: "bounce" },
              random: false,
              speed: 0.5,
              straight: false,
            },
            number: {
              density: { enable: true, area: 800 },
              value: 60,
            },
            opacity: { value: 0.2 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 2 } },
          },
          detectRetina: true,
        }}
      />

      {/* Global Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-white/30 tracking-widest uppercase pointer-events-none z-50">
        Made with ❤️ at IrvineHacks
      </div>
    </div>
  );
}
