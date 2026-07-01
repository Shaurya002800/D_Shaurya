import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen({ onComplete }) {
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const totalDuration = 2200;
    const exitDuration = 650;
    let completionTimer;

    const timer = setTimeout(() => {
      setExit(true);

      completionTimer = setTimeout(() => {
        onComplete();
      }, exitDuration);
    }, totalDuration);

    return () => {
      clearTimeout(timer);
      clearTimeout(completionTimer);
    };
  }, [onComplete]);

  // Layered fiery smoke particles and fierce crimson embers
  const smokeParticles = Array.from({ length: 6 });
  const emberParticles = Array.from({ length: 10 });

  // Custom premium easing curve for ultra-smooth lines
  const premiumEase = [0.16, 1, 0.3, 1];

  return (
    <AnimatePresence>
      {!exit && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            filter: "blur(14px)",
            transition: {
              duration: 0.52,
              ease: [0.76, 0, 0.24, 1], // Deep cinematic exit curve
            },
          }}
          style={{
            position: "fixed",
            inset: 0,
            // 🔴 CHANGED: Changed background from deep blue to a dark obsidian-crimson gradient
            background:
              "radial-gradient(circle at center, #1a0404 0%, #030000 100%)",
            zIndex: 99999,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* BACKGROUND TEXTURE GRID OVERLAY */}
          <div 
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.02, // Kept subtle
              backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              pointerEvents: "none"
            }}
          />

          {/* AMBIENT FIERY MIST / SMOKE */}
          {smokeParticles.map((_, i) => (
            <motion.div
              key={`smoke-${i}`}
              animate={{
                y: [-20, -160],
                x: [0, i % 2 === 0 ? 45 : -45],
                opacity: [0, 0.06, 0],
                scale: [0.7, 1.6],
              }}
              transition={{
                duration: 8 + i,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.4,
              }}
              style={{
                position: "absolute",
                bottom: "10%",
                left: `${15 + i * 9}%`,
                width: 140,
                height: 140,
                borderRadius: "50%",
                // 🔴 CHANGED: Tinted the smoke layers with a soft crimson heat hue
                background:
                  "radial-gradient(circle, rgba(255, 40, 40, 0.08) 0%, transparent 70%)",
                filter: "blur(32px)",
                pointerEvents: "none"
              }}
            />
          ))}

          {/* CONQUEROR'S HAKI EMBERS / SPARKS */}
          {emberParticles.map((_, i) => (
            <motion.div
              key={`ember-${i}`}
              animate={{
                y: [0, -270],
                x: [0, Math.sin(i) * 40],
                opacity: [0, 0.7, 0], // Made them flash brighter
                scale: [0, 1.2, 0.4]
              }}
              transition={{
                duration: 3.5 + (i % 3), // Faster speed for higher energy vibe
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 0.25
              }}
              style={{
                position: "absolute",
                bottom: "25%",
                left: `${15 + (i * 5.8)}%`,
                width: i % 2 === 0 ? 3 : 2,
                height: i % 2 === 0 ? 4 : 2, // Slightly elongated like real rising sparks
                // 🔴 CHANGED: Transformed from soft gold to bright crimson-orange embers
                backgroundColor: "rgba(255, 75, 40, 0.9)",
                borderRadius: "40%",
                filter: "blur(0.3px)",
                // Intense ruby outer glow
                boxShadow: "0 0 10px rgba(255, 10, 10, 0.9), 0 0 4px rgba(255, 200, 50, 0.6)",
                pointerEvents: "none"
              }}
            />
          ))}

          {/* CORE COMPOSITION GLOW (HAKI AURA CENTER) */}
          <motion.div
            animate={{
              scale: [0.93, 1.07, 0.93],
              opacity: [0.18, 0.32, 0.18], // Enhanced glow intensity
            }}
            transition={{
              duration: 4, // Pulsates slightly faster
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              width: 460,
              height: 460,
              borderRadius: "50%",
              // 🔴 CHANGED: Changed core background glow from light blue to a fierce ruby-red aura
              background:
                "radial-gradient(circle, rgba(255, 30, 30, 0.16) 0%, transparent 65%)",
              filter: "blur(52px)",
              pointerEvents: "none"
            }}
          />

          {/* FACE VECTOR ART CONTAINER */}
          <motion.div
            animate={{
              y: [0, -4, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              width: "min(36vw, 240px)",
              aspectRatio: "1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              zIndex: 2
            }}
          >
            <svg
              viewBox="0 0 320 320"
              fill="none"
              style={{
                width: "100%",
                overflow: "visible",
              }}
            >
              {/* HIGH-END GLOW FILTERS */}
              <defs>
                <filter id="haki-glow" x="-30%" y="-30%" width="160%" height="160%">
                  {/* 🔴 CHANGED: Increased the blur radius slightly so the white strokes emit a heavier aura */}
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g filter="url(#haki-glow)">
                {/* LEFT BROW */}
                <motion.path
                  d="M72 98 C104 104, 139 115, 159 145"
                  stroke="rgba(255,255,255,0.98)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    duration: 0.72,
                    ease: premiumEase,
                  }}
                />

                {/* RIGHT BROW */}
                <motion.path
                  d="M197 112 C222 92, 247 78, 278 72"
                  stroke="rgba(255,255,255,0.98)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    duration: 0.72,
                    delay: 0.12,
                    ease: premiumEase,
                  }}
                />

                {/* CENTER LINE */}
                <motion.path
                  d="M160 110 C155 149,156 182,163 217"
                  stroke="rgba(255,255,255,0.98)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    duration: 0.76,
                    delay: 0.24,
                    ease: premiumEase,
                  }}
                />

                {/* EYES LAYER */}
                <g>
                  <motion.path
                    d="M86 164 C103 148,124 148,148 160 C131 163,111 168,88 165 Z"
                    fill="white"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.42,
                      delay: 0.54,
                      ease: "easeOut"
                    }}
                  />

                  <motion.path
                    d="M207 161 C225 145,246 145,270 156 C254 160,234 166,209 162 Z"
                    fill="white"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.42,
                      delay: 0.64,
                      ease: "easeOut"
                    }}
                  />
                </g>

                {/* SCAR DETAILS */}
                <motion.path
                  d="M232 150 L234 180 M248 145 L249 176 M264 148 L265 173"
                  // 🔴 CHANGED: Changed scar tint slightly towards a subtle fresh crimson accent
                  stroke="rgba(255, 210, 210, 0.9)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    pathLength: {
                      duration: 0.46,
                      delay: 0.78,
                    },
                    opacity: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    },
                  }}
                />

                {/* ICONIC SMILE */}
                <g style={{ transformOrigin: "160px 230px" }}>
                  <motion.path
                    d="M83 198 C121 201,162 200,234 196 C247 195,256 194,267 192 C266 220,254 241,225 253 C196 264,132 263,106 249 C87 239,80 222,83 198 Z"
                    fill="white"
                    initial={{
                      opacity: 0,
                      scale: 0.94,
                      y: 4
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0
                    }}
                    transition={{
                      duration: 0.6,
                      delay: 0.96,
                      ease: [0.34, 1.56, 0.64, 1], // Dynamic overshoot ease
                    }}
                  />

                  {/* Inner lip shadow line */}
                  <motion.path
                    d="M85 198 C119 210,161 213,220 211 C239 210,252 206,265 192"
                    stroke="#000000"
                    strokeWidth="1.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                    transition={{
                      delay: 1.22,
                      duration: 0.34,
                    }}
                  />
                </g>
              </g>
            </svg>
          </motion.div>

          {/* STAGGERED REVEAL "AWAKENING" TEXT */}
          <div
            style={{
              position: "absolute",
              bottom: 70,
              display: "flex",
              gap: "0.55em",
              letterSpacing: "0.45em",
              fontSize: 11,
              fontWeight: 500, // Slightly bolder to pop against the red glow
              // 🔴 CHANGED: Given the text a glowing deep crimson/coral color palette
              color: "rgba(255, 90, 90, 0.6)",
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              textShadow: "0 0 14px rgba(255,0,0,0.4)"
            }}
          >
            {"AWAKENING".split("").map((letter, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 3 }}
                animate={{ 
                  opacity: [0, 0.85, 0.6], // Kept it highly readable
                  y: 0 
                }}
                transition={{
                  duration: 0.7,
                  delay: 1.08 + index * 0.035,
                  ease: "easeOut"
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
