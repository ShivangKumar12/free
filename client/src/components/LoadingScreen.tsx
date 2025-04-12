import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  onLoadComplete: () => void;
  profileImage: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadComplete, profileImage }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onLoadComplete();
          }, 1500); // Delay to show the 100% before completing
          return 100;
        }
        return prevProgress + Math.random() * 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onLoadComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={progress >= 100 ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <motion.div 
        className="relative w-48 h-48 mb-12 overflow-hidden rounded-full flex items-center justify-center"
        animate={{
          rotateY: progress >= 100 ? 360 : 0,
          scale: progress >= 100 ? 0.8 : 1,
        }}
        transition={{ 
          duration: 1.5, 
          ease: "easeInOut",
          type: "spring", 
          stiffness: 100 
        }}
      >
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse-slow"></div>
        <img 
          src={profileImage} 
          alt="Shivang Kumar" 
          className="absolute inset-0 w-full h-full object-cover rounded-full"
        />
      </motion.div>

      <motion.h1 
        className="mb-8 text-4xl font-bold text-center font-orbitron"
        animate={{ 
          y: progress >= 100 ? -20 : 0,
          scale: progress >= 100 ? 1.2 : 1
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <span className="text-primary">PORTFOLIO</span>
      </motion.h1>

      <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>

      <motion.p 
        className="text-gray-400"
        animate={{ opacity: progress >= 100 ? 0 : 1 }}
      >
        {Math.round(progress)}%
      </motion.p>

      {progress >= 100 && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <motion.div
            className="text-2xl text-primary font-bold font-space"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            Welcome
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LoadingScreen;