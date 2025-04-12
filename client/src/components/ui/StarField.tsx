import React, { useEffect, useRef } from 'react';

interface StarFieldProps {
  starCount?: number;
}

const StarField: React.FC<StarFieldProps> = ({ starCount = 150 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    container.innerHTML = '';
    
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 4}s`;
      container.appendChild(star);
    }
  }, [starCount]);
  
  return (
    <div 
      ref={containerRef} 
      id="stars-container" 
      className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10"
    ></div>
  );
};

export default StarField;
