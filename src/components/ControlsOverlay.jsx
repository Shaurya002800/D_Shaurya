import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ControlsOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeAction, setActiveAction] = useState(null);

  useEffect(() => {
    // Cinematic delayed entry
    const showTimeout = setTimeout(() => setIsVisible(true), 1500);
    // Extended viewing time for cinematic layout
    const hideTimeout = setTimeout(() => setIsVisible(false), 10000);

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        setActiveAction('move');
        setTimeout(() => setIsVisible(false), 1500); // Hide shortly after they learn to move
      }
      if (key === 'e') setActiveAction('interact');
    };

    const handleKeyUp = () => setActiveAction(null);
    const handleMouseDown = () => setActiveAction('drag');
    const handleMouseUp = () => setActiveAction(null);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Framer Motion Orchestration
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.2 }
    },
    exit: { 
      opacity: 0, y: 10, filter: 'blur(5px)', transition: { duration: 0.8 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '120px',
            zIndex: 999,
            pointerEvents: 'none',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: '35px',
            // Protective shadow gradient ensuring text legibility without a box
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>

            {/* BLOCK 1: MOVEMENT */}
            <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ color: activeAction === 'move' ? '#ef4444' : 'rgba(255,255,255,0.4)', fontSize: '14px' }}>[</span>
                <span style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '11px', 
                  letterSpacing: '0.2em',
                  fontWeight: activeAction === 'move' ? '700' : '400',
                  color: activeAction === 'move' ? '#ffffff' : 'rgba(255,255,255,0.8)',
                  transition: 'color 0.2s'
                }}>
                  WASD
                </span>
                <span style={{ color: activeAction === 'move' ? '#ef4444' : 'rgba(255,255,255,0.4)', fontSize: '14px' }}>]</span>
              </div>
              <span style={{ fontFamily: 'sans-serif', fontSize: '11px', letterSpacing: '0.1em', color: '#ffffff', textTransform: 'uppercase' }}>
                Move
              </span>
            </motion.div>

            {/* SEPARATOR */}
            <motion.div variants={itemVariants} style={{ width: '30px', height: '1px', backgroundColor: 'rgba(255,255,255,0.15)' }} />

            {/* BLOCK 2: INTERACTION */}
            <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ color: activeAction === 'interact' ? '#ef4444' : 'rgba(255,255,255,0.4)', fontSize: '14px' }}>[</span>
                <span style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '11px', 
                  letterSpacing: '0.2em',
                  fontWeight: activeAction === 'interact' ? '700' : '400',
                  color: activeAction === 'interact' ? '#ffffff' : 'rgba(255,255,255,0.8)',
                  transition: 'color 0.2s'
                }}>
                  E
                </span>
                <span style={{ color: activeAction === 'interact' ? '#ef4444' : 'rgba(255,255,255,0.4)', fontSize: '14px' }}>]</span>
              </div>
              <span style={{ fontFamily: 'sans-serif', fontSize: '11px', letterSpacing: '0.1em', color: '#ffffff', textTransform: 'uppercase' }}>
                Interact
              </span>
            </motion.div>

            {/* SEPARATOR */}
            <motion.div variants={itemVariants} style={{ width: '30px', height: '1px', backgroundColor: 'rgba(255,255,255,0.15)' }} />

            {/* BLOCK 3: CAMERA ORBIT */}
            <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ color: activeAction === 'drag' ? '#ef4444' : 'rgba(255,255,255,0.4)', fontSize: '14px' }}>[</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={activeAction === 'drag' ? '#ffffff' : 'rgba(255,255,255,0.8)'} strokeWidth="2">
                    <path d="M5 9l-3 3 3 3M19 9l3 3-3 3" />
                    <circle cx="12" cy="12" r="3" fill={activeAction === 'drag' ? '#ef4444' : 'none'} stroke={activeAction === 'drag' ? '#ef4444' : 'currentColor'} />
                  </svg>
                </div>
                <span style={{ color: activeAction === 'drag' ? '#ef4444' : 'rgba(255,255,255,0.4)', fontSize: '14px' }}>]</span>
              </div>
              <span style={{ fontFamily: 'sans-serif', fontSize: '11px', letterSpacing: '0.1em', color: '#ffffff', textTransform: 'uppercase' }}>
                Orbit View
              </span>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}