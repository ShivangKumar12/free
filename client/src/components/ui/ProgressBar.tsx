import React, { useEffect, useState } from 'react';

const ProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progressValue = (scrollTop / (documentHeight - windowHeight)) * 100;
      setProgress(progressValue);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-50">
      <div 
        className="h-full bg-gradient-to-r from-secondary to-primary transition-[width]" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
