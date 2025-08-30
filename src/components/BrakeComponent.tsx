import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface BrakeComponentProps {
  currentSpeed: number;
  drowsinessLevel: 'normal' | 'drowsy' | 'critical';
}

const BrakeComponent: React.FC<BrakeComponentProps> = ({ 
  currentSpeed, 
  drowsinessLevel 
}) => {
  const [brakePressed, setBrakePressed] = useState(false);
  const [brakeForce, setBrakeForce] = useState(0);

  useEffect(() => {
    if (drowsinessLevel === 'critical') {
      setBrakePressed(true);
      setBrakeForce(100); // Full brake
    } else if (drowsinessLevel === 'drowsy') {
      setBrakePressed(true);
      setBrakeForce(40); // Partial brake
    } else {
      setBrakePressed(false);
      setBrakeForce(0);
    }
  }, [drowsinessLevel]);

  const getBrakeStatus = () => {
    if (drowsinessLevel === 'critical') return 'EMERGENCY BRAKE';
    if (drowsinessLevel === 'drowsy') return 'SAFETY BRAKE';
    return 'READY';
  };

  const getBrakeColor = () => {
    if (drowsinessLevel === 'critical') return 'red';
    if (drowsinessLevel === 'drowsy') return 'yellow';
    return 'gray';
  };

  const brakeColor = getBrakeColor();

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="w-5 h-5 text-orange-400" />
        <h3 className="text-white font-semibold">Auto Brake System</h3>
      </div>

      {/* Brake Pedal Visual */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative bg-gray-900 rounded-lg p-6 border-2 border-gray-600">
          {/* Pedal */}
          <div className={`relative transition-all duration-300 ${
            brakePressed ? 'transform translate-y-2' : ''
          }`}>
            <div className={`w-16 h-20 rounded-lg border-4 transition-all duration-300 ${
              brakeColor === 'red' ? 'border-red-400 bg-red-500/30 shadow-lg shadow-red-500/50' :
              brakeColor === 'yellow' ? 'border-yellow-400 bg-yellow-500/30 shadow-lg shadow-yellow-500/50' :
              'border-gray-500 bg-gray-600/30'
            } ${brakePressed ? 'shadow-inner' : 'shadow-lg'}`}>
              <div className={`w-full h-full rounded-md flex items-center justify-center transition-all duration-300 ${
                brakePressed ? 'bg-gray-800' : 'bg-gray-700'
              }`}>
                <div className="text-white text-xs font-bold transform rotate-90">
                  BRAKE
                </div>
              </div>
              {brakePressed && (
                <div className="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-lg border-2 border-dashed border-white/30 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="text-center">
          <div className={`text-lg font-bold mb-1 ${
            brakeColor === 'red' ? 'text-red-400' :
            brakeColor === 'yellow' ? 'text-yellow-400' : 'text-gray-400'
          }`}>
            {getBrakeStatus()}
          </div>
          <div className="text-sm text-gray-400">
            Speed: {Math.round(currentSpeed)} km/h
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrakeComponent;