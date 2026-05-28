import { useState } from 'react';

const sections = [
  { id: 'explore', label: 'EXPLORE', imgSrc: '/image 49.png' },
  { id: 'about',   label: 'ABOUT',   imgSrc: '/image 50.png' },
  { id: 'work',    label: 'WORK',    imgSrc: '/image 51.png' },
  { id: 'skills',  label: 'SKILLS',  imgSrc: '/image 52.png' },
];

export default function NavWheels({ activeSection, onNavigate }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      position: 'fixed',
      left: '32px', // Moved slightly right so it breathes better against the screen edge
      top: '38%',   // Shifted upwards from 50% for better visual hierarchy
      transform: 'translateY(-50%)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: '36px',  // Increased gap to give the larger wheels more breathing room
      alignItems: 'center',
    }}>
      {sections.map(({ id, label, imgSrc }) => {
        const isActive  = activeSection === id;
        const isHovered = hovered === id;

        return (
          <div
            key={id}
            onClick={() => onNavigate(id)}
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            {/* Custom Image Asset Integration */}
            <img 
              src={imgSrc}
              alt={`${label} Nav Wheel`}
              style={{
                // Increased all dimensions significantly for better visibility
                width:  isActive ? '110px' : isHovered ? '95px' : '85px',
                height: isActive ? '110px' : isHovered ? '95px' : '85px',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                filter: isActive
                  ? 'drop-shadow(0 0 10px rgba(240,192,64,0.8)) brightness(1.2)'
                  : isHovered
                    ? 'drop-shadow(0 0 6px rgba(240,192,64,0.5)) brightness(1.1)'
                    : 'brightness(0.85)',
                animation: isActive ? 'wheelSpin 8s linear infinite' : 'none',
              }}
            />

            {/* External Label — shows on hover or active */}
            <div style={{
              position: 'absolute',
              left: 'calc(100% + 20px)', // Pushed further out to clear the larger images
              whiteSpace: 'nowrap',
              fontFamily: '"Pirata One", cursive',
              fontSize: '22px', // Bumped font size to match the larger wheels
              color: isActive ? '#f0c040' : 'rgba(255,255,255,0.75)',
              letterSpacing: '0.1em',
              opacity: isActive || isHovered ? 1 : 0,
              transform: isHovered || isActive
                ? 'translateX(0)'
                : 'translateX(-10px)',
              transition: 'all 0.25s ease',
              pointerEvents: 'none',
              textShadow: isActive
                ? '0 0 12px rgba(240,192,64,0.8)'
                : '0 1px 4px rgba(0,0,0,0.8)',
            }}>
              {label}
            </div>
          </div>
        );
      })}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pirata+One&display=swap');
        @keyframes wheelSpin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}