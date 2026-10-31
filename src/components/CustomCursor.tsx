import React, { useEffect, useState, useRef } from 'react';
import { CursorType } from '../types/claims';

interface CustomCursorProps {
  cursorType: CursorType;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ cursorType }) => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isClicking, setIsClicking] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const requestRef = useRef<number | null>(null);
  const mouseCoords = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (cursorType === 'default') {
      document.body.classList.remove('custom-cursor-active');
      return;
    }

    document.body.classList.add('custom-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      mouseCoords.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable =
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'SELECT' ||
          target.closest('button') !== null ||
          target.closest('a') !== null ||
          target.getAttribute('role') === 'button' ||
          target.classList.contains('cursor-pointer');
        setIsHoveringClickable(!!isClickable);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);

      // Create burst particles on click
      if (cursorType === 'happy') {
        const newParticles: Particle[] = Array.from({ length: 7 }).map((_, i) => ({
          id: Date.now() + i,
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 4 + 3,
          color: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'][i % 5],
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6 - 2,
          life: 1.0
        }));
        setParticles((prev) => [...prev.slice(-15), ...newParticles]);
      }
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    const updateLoop = () => {
      setPos({ x: mouseCoords.current.x, y: mouseCoords.current.y });

      // Animate particles
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15, // gravity
            life: p.life - 0.04
          }))
          .filter((p) => p.life > 0)
      );

      requestRef.current = requestAnimationFrame(updateLoop);
    };

    requestRef.current = requestAnimationFrame(updateLoop);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [cursorType, isVisible]);

  if (cursorType === 'default' || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Click Burst Particles for Happy Face mode */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="fixed pointer-events-none rounded-full z-[9999]"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            opacity: p.life,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 6px ${p.color}`
          }}
        />
      ))}

      {/* Main Custom Cursor */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[99999] transition-transform duration-75 ease-out select-none"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(${
            cursorType === 'hand' ? '-8px, -2px' : '-50%, -50%'
          }) scale(${isClicking ? 0.85 : isHoveringClickable ? 1.25 : 1})`,
          willChange: 'transform'
        }}
      >
        {cursorType === 'hand' && (
          <div className="relative group filter drop-shadow-md">
            {/* Manito Chévere */}
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-all duration-150 ${isClicking ? 'rotate-[-12deg]' : ''}`}
            >
              {/* Soft outer glow */}
              <circle cx="12" cy="12" r="10" fill="#003366" fillOpacity="0.08" />
              {/* Hand base */}
              <path
                d="M9 11V4.5C9 3.67 9.67 3 10.5 3C11.33 3 12 3.67 12 4.5V10.5M12 7.5C12 6.67 12.67 6 13.5 6C14.33 6 15 6.67 15 7.5V11M15 9.5C15 8.67 15.67 8 16.5 8C17.33 8 18 8.67 18 9.5V14C18 17.31 15.31 20 12 20C9.5 20 7.35 18.5 6.4 16.3L4.5 12.4C4.15 11.7 4.45 10.85 5.15 10.5C5.85 10.15 6.7 10.45 7.05 11.15L8.5 14"
                stroke="#002244"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 11V4.5C9 3.67 9.67 3 10.5 3C11.33 3 12 3.67 12 4.5V10.5M12 7.5C12 6.67 12.67 6 13.5 6C14.33 6 15 6.67 15 7.5V11M15 9.5C15 8.67 15.67 8 16.5 8C17.33 8 18 8.67 18 9.5V14C18 17.31 15.31 20 12 20C9.5 20 7.35 18.5 6.4 16.3L4.5 12.4C4.15 11.7 4.45 10.85 5.15 10.5C5.85 10.15 6.7 10.45 7.05 11.15L8.5 14"
                stroke="#FFFFFF"
                strokeWidth="1.8"
                fill="#FFCC00"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Highlight dot on index fingertip */}
              <circle cx="10.5" cy="4.5" r="1.2" fill="#FFFFFF" />
            </svg>
            {isClicking && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-75" />
            )}
          </div>
        )}

        {cursorType === 'happy' && (
          <div className="relative filter drop-shadow-lg">
            {/* Carita Feliz Bacana */}
            <div
              className={`w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 border-2 border-amber-600/60 shadow-md flex items-center justify-center transition-all ${
                isClicking ? 'scale-90 rotate-12' : isHoveringClickable ? 'scale-110' : ''
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Eyes */}
                {isClicking ? (
                  // Winking or laughing eyes on click
                  <>
                    <path d="M7 10C8 8.5 10 8.5 10 10" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
                    <path d="M14 9L17 11" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
                    <path d="M17 9L14 11" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <ellipse cx="8.5" cy="9.5" rx="1.5" ry="2.2" fill="#78350F" />
                    <ellipse cx="15.5" cy="9.5" rx="1.5" ry="2.2" fill="#78350F" />
                    {/* Sparkle highlights */}
                    <circle cx="9" cy="8.8" r="0.6" fill="#FFFFFF" />
                    <circle cx="16" cy="8.8" r="0.6" fill="#FFFFFF" />
                  </>
                )}
                {/* Cheeks */}
                <circle cx="6" cy="12.5" r="1.5" fill="#F87171" opacity="0.75" />
                <circle cx="18" cy="12.5" r="1.5" fill="#F87171" opacity="0.75" />
                {/* Big Happy Smile */}
                <path
                  d="M7.5 13.5C8.8 17 15.2 17 16.5 13.5"
                  stroke="#78350F"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="#991B1B"
                />
              </svg>
            </div>
            {isHoveringClickable && (
              <span className="absolute -top-1 -right-1 text-xs select-none animate-bounce">✨</span>
            )}
          </div>
        )}

        {cursorType === 'anchor' && (
          <div className="relative filter drop-shadow-md">
            {/* Kuehne + Nagel Anchor Cursor */}
            <div
              className={`w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center border-2 border-white shadow-lg transition-transform ${
                isClicking ? 'scale-90 rotate-45' : isHoveringClickable ? 'scale-110' : ''
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="3" />
                <line x1="12" y1="8" x2="12" y2="21" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <path d="M5 14a7 7 0 0 0 14 0" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
