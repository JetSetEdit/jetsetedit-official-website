'use client';

import { useEffect, useState } from 'react';

export const GradientCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className="pointer-events-none fixed inset-0 z-30 transition duration-300"
      style={{
        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(0,178,255,0.05), transparent 40%)`
      }}
    />
  );
}; 