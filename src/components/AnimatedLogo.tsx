import React from 'react';

interface AnimatedLogoProps {
  size?: number;
  className?: string;
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ size = 40, className = '' }) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Base container with gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg"></div>
      
      {/* Outer rotating circle with gap */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3/4 h-3/4 rounded-full border-4 border-white opacity-80 animate-spin-slow" 
             style={{ 
               clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%)',
               animation: 'spin 8s linear infinite'
             }}>
        </div>
      </div>
      
      {/* Middle rotating circle with gap - opposite direction */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1/2 h-1/2 rounded-full border-3 border-white opacity-70"
             style={{ 
               clipPath: 'polygon(0% 0%, 85% 0%, 100% 85%, 100% 100%, 0% 100%)',
               animation: 'spin-reverse 6s linear infinite'
             }}>
        </div>
      </div>
      
      {/* Inner rotating circle with gap */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1/3 h-1/3 rounded-full border-2 border-white opacity-90"
             style={{ 
               clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 15%)',
               animation: 'spin 4s linear infinite'
             }}>
        </div>
      </div>
      
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1/6 h-1/6 rounded-full bg-white"></div>
      </div>
    </div>
  );
};

export default AnimatedLogo;
