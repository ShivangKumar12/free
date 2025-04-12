import React from 'react';

interface SectionHeadingProps {
  title: string;
  highlight: string;
  description?: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ 
  title, 
  highlight, 
  description 
}) => {
  return (
    <div className="text-center mb-16">
      <h2 className="inline-block text-3xl md:text-5xl font-bold font-space mb-4 relative">
        {title} <span className="text-primary">{highlight}</span>
        <div className="h-1 w-full bg-gradient-to-r from-secondary to-primary mt-2"></div>
      </h2>
      {description && (
        <p className="text-gray-300 max-w-2xl mx-auto">{description}</p>
      )}
    </div>
  );
};

export default SectionHeading;
