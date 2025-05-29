import React from 'react';

interface TaskFlowLogoProps {
  size?: number;
  className?: string;
  isDarkMode?: boolean;
}

const TaskFlowLogo: React.FC<TaskFlowLogoProps> = ({ 
  size = 40, 
  className = '',
  isDarkMode = false
}) => {
  // Colors based on theme
  const primaryColor = isDarkMode ? '#8ecdf7' : '#3b82f6';
  const secondaryColor = isDarkMode ? '#a78bfa' : '#8b5cf6';
  const accentColor = isDarkMode ? '#22c55e' : '#10b981';
  const textColor = isDarkMode ? '#e2e8f0' : '#1e293b';
  
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Base container with gradient background */}
      <div className="absolute inset-0 rounded-lg overflow-hidden" 
           style={{ 
             background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
             boxShadow: `0 4px 6px rgba(0, 0, 0, 0.1)`
           }}>
      </div>
      
      {/* Task list visualization */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
        {/* Checkmark circle - rotating */}
        <div className="absolute" 
             style={{ 
               width: size * 0.7, 
               height: size * 0.7, 
               borderRadius: '50%',
               border: `${size * 0.04}px dashed ${accentColor}`,
               borderRightColor: 'transparent',
               animation: 'spin 8s linear infinite'
             }}>
        </div>
        
        {/* Checkmark */}
        <div className="absolute" 
             style={{
               width: size * 0.25,
               height: size * 0.5,
               borderRight: `${size * 0.06}px solid ${accentColor}`,
               borderBottom: `${size * 0.06}px solid ${accentColor}`,
               transform: 'rotate(45deg) translate(0%, -30%)',
               animation: 'pulse 2s ease-in-out infinite'
             }}>
        </div>
        
        {/* Task lines - animated */}
        <div className="absolute flex flex-col space-y-1 items-start"
             style={{
               top: '60%',
               left: '25%',
               width: size * 0.5
             }}>
          <div style={{ 
            height: size * 0.06, 
            width: '90%', 
            backgroundColor: textColor,
            opacity: 0.7,
            borderRadius: size * 0.03,
            animation: 'width-change 3s ease-in-out infinite'
          }}></div>
          <div style={{ 
            height: size * 0.06, 
            width: '70%', 
            backgroundColor: textColor,
            opacity: 0.5,
            borderRadius: size * 0.03,
            animation: 'width-change 3s ease-in-out infinite 0.5s'
          }}></div>
          <div style={{ 
            height: size * 0.06, 
            width: '40%', 
            backgroundColor: textColor,
            opacity: 0.3,
            borderRadius: size * 0.03,
            animation: 'width-change 3s ease-in-out infinite 1s'
          }}></div>
        </div>
      </div>
    </div>
  );
};

export default TaskFlowLogo;
