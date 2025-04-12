import React, { ReactNode } from 'react';

interface FloatingElementProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

const FloatingElement: React.FC<FloatingElementProps> = ({ 
  children, 
  delay = 0,
  className = '' 
}) => {
  const animationStyle = {
    animationDelay: `${delay}s`
  };
  
  return (
    <div 
      className={`animate-float ${className}`}
      style={animationStyle}
    >
      {children}
    </div>
  );
};

export default FloatingElement;
