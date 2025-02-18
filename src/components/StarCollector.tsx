'use client';

import { useEffect, useState, useRef } from 'react';
import { Star } from 'lucide-react';

interface StarPoint {
  id: string;
  x: number;
  y: number;
}

export const StarCollector = () => {
  const [stars, setStars] = useState<StarPoint[]>([]);
  const [score, setScore] = useState(0);
  const idCounter = useRef(0);

  // Generate new star at random position
  const generateStar = () => {
    idCounter.current += 1;
    const id = `star-${idCounter.current}`;
    const x = Math.random() * (window.innerWidth - 40);
    const y = Math.random() * (window.innerHeight - 40);
    return { id, x, y };
  };

  // Initialize stars
  useEffect(() => {
    const initialStars = Array.from({ length: 3 }, generateStar);
    setStars(initialStars);

    // Reset counter when component unmounts
    return () => {
      idCounter.current = 0;
    };
  }, []);

  // Handle mouse movement and star collection
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Check for star collection (within 40px radius)
      stars.forEach(star => {
        const distance = Math.hypot(e.clientX - star.x, e.clientY - star.y);
        if (distance < 40) {
          // Remove collected star and add new one
          setStars(prev => [
            ...prev.filter(s => s.id !== star.id),
            generateStar()
          ]);
          setScore(prev => prev + 1);
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [stars]);

  return (
    <>
      <div className="fixed top-4 right-4 bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-[#00B2FF] font-light">
        Stars: {score}
      </div>
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute pointer-events-none transition-opacity"
          style={{
            left: `${star.x}px`,
            top: `${star.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <Star 
            className="text-[#00B2FF] animate-pulse" 
            size={24}
            fill="#00B2FF"
            fillOpacity={0.2}
          />
        </div>
      ))}
    </>
  );
}; 