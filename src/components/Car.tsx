import React, { useState, useEffect } from 'react';

interface CarProps {
  drowsinessLevel: 'normal' | 'drowsy' | 'critical';
}

const Car: React.FC<CarProps> = ({ drowsinessLevel }) => {
  const [blinkState, setBlinkState] = useState(true);

  // Blink animation only when drowsy
  useEffect(() => {
    if (drowsinessLevel === 'drowsy') {
      const interval = setInterval(() => {
        setBlinkState(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setBlinkState(true); // Reset lights to ON (for critical) or dim (for normal)
    }
  }, [drowsinessLevel]);

  const getLightOpacity = () => {
    if (drowsinessLevel === 'critical') return 1;       // Emergency brake → always ON
    if (drowsinessLevel === 'drowsy') return blinkState ? 1 : 0.2; // Blink when drowsy
    return 0.2; // Normal → dim
  };

  const getLightGlow = () => {
    if (drowsinessLevel === 'critical') return 'drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]';
    if (drowsinessLevel === 'drowsy' && blinkState) return 'drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]';
    return '';
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Car Body */}
      <div className="relative">
        <svg 
          width="400" 
          height="200" 
          viewBox="0 0 400 200" 
          className="drop-shadow-2xl"
        >
          {/* Car Body */}
          <rect x="50" y="80" width="300" height="80" rx="10" fill="#2563eb" />
          <rect x="80" y="50" width="240" height="50" rx="15" fill="#1e40af" />
          <rect x="90" y="55" width="220" height="40" rx="8" fill="#93c5fd" opacity="0.7" />

          {/* Wheels */}
          <circle cx="100" cy="170" r="25" fill="#374151" />
          <circle cx="100" cy="170" r="15" fill="#6b7280" />
          <circle cx="300" cy="170" r="25" fill="#374151" />
          <circle cx="300" cy="170" r="15" fill="#6b7280" />

          {/* Front Lights */}
          <ellipse 
            cx="365" cy="100" rx="12" ry="20" fill="#fbbf24" 
            opacity={getLightOpacity()}
            className={`transition-opacity duration-200 ${getLightGlow()}`}
          />
          <ellipse 
            cx="365" cy="130" rx="12" ry="20" fill="#fbbf24" 
            opacity={getLightOpacity()}
            className={`transition-opacity duration-200 ${getLightGlow()}`}
          />

          {/* Back Lights */}
          <ellipse 
            cx="35" cy="100" rx="12" ry="20" fill="#ef4444" 
            opacity={getLightOpacity()}
            className={`transition-opacity duration-200 ${getLightGlow()}`}
          />
          <ellipse 
            cx="35" cy="130" rx="12" ry="20" fill="#ef4444" 
            opacity={getLightOpacity()}
            className={`transition-opacity duration-200 ${getLightGlow()}`}
          />

          {/* Car Details */}
          <rect x="120" y="90" width="30" height="15" rx="3" fill="#1f2937" />
          <rect x="160" y="90" width="80" height="15" rx="3" fill="#1f2937" />
          <rect x="250" y="90" width="30" height="15" rx="3" fill="#1f2937" />
        </svg>
      </div>
    </div>
  );
};

export default Car;
