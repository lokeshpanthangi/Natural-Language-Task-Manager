import React from 'react';

interface MinimalistLogoProps {
  size?: number;
  className?: string;
}

const MinimalistLogo: React.FC<MinimalistLogoProps> = ({ 
  size = 40, 
  className = ''
}) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Base container with green background */}
      <div className="absolute inset-0 rounded-lg overflow-hidden" 
           style={{ 
             background: 'linear-gradient(135deg, #10b981, #059669)',
             boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
           }}>
      </div>
      
      {/* Simple checkmark */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          style={{
            width: size * 0.4,
            height: size * 0.25,
            borderRight: `${size * 0.08}px solid white`,
            borderBottom: `${size * 0.08}px solid white`,
            transform: 'rotate(45deg) translate(0%, -30%)'
          }}>
        </div>
      </div>
    </div>
  );
};

export default MinimalistLogo;
