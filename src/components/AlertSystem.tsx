import React, { useEffect, useState } from 'react';
import { AlertTriangle, Coffee, MapPin, Clock } from 'lucide-react';

interface AlertSystemProps {
  drowsinessLevel: 'normal' | 'drowsy' | 'critical';
  eyeOpenness: number;
  currentSpeed: number;
  eta: string;
}

const AlertSystem: React.FC<AlertSystemProps> = ({ 
  drowsinessLevel, 
  eyeOpenness, 
  currentSpeed, 
  eta 
}) => {
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context on user interaction
    const initAudio = () => {
      if (!audioContext) {
        setAudioContext(new (window.AudioContext || (window as any).webkitAudioContext)());
      }
    };

    document.addEventListener('click', initAudio, { once: true });
    return () => document.removeEventListener('click', initAudio);
  }, [audioContext]);

  useEffect(() => {
    if (drowsinessLevel === 'critical' && !isAlarmActive) {
      setIsAlarmActive(true);
      playAlarmSound();
    } else if (drowsinessLevel !== 'critical') {
      setIsAlarmActive(false);
    }
  }, [drowsinessLevel, isAlarmActive]);

  const playAlarmSound = () => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.4);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  };

  const nearbyRestStops = [
    { name: "Highway Rest Area", distance: "12 km", time: "8 mins" },
    { name: "Petrol Pump & Cafe", distance: "18 km", time: "12 mins" },
    { name: "Dhaba Restaurant", distance: "25 km", time: "16 mins" }
  ];

  return (
    <div className="space-y-4">
      {/* Critical Emergency Alert */}
      {drowsinessLevel === 'critical' && (
        <div className={`p-4 bg-red-500/20 border-2 border-red-500 rounded-lg ${
          isAlarmActive ? 'animate-pulse' : ''
        }`}>
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-400 animate-bounce" />
            <div>
              <h3 className="text-red-400 font-bold text-lg">EMERGENCY BRAKE ACTIVATED</h3>
              <p className="text-red-300">Driver appears unconscious. Pulling over safely...</p>
            </div>
          </div>
        </div>
      )}

      {/* Drowsiness Warning */}
      {drowsinessLevel === 'drowsy' && (
        <div className="p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg">
          <div className="flex items-center space-x-3">
            <Coffee className="w-5 h-5 text-yellow-400" />
            <div>
              <h3 className="text-yellow-400 font-semibold">Driver Drowsiness Detected</h3>
              <p className="text-yellow-300 text-sm">Speed reduced for safety. Consider taking a break.</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Panel */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400">Eye Openness</div>
          <div className="text-2xl font-bold text-white">{Math.round(eyeOpenness)}%</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                eyeOpenness > 70 ? 'bg-green-400' : 
                eyeOpenness > 40 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${eyeOpenness}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Updated ETA</span>
          </div>
          <div className="text-2xl font-bold text-white">{eta}</div>
          {drowsinessLevel !== 'normal' && (
            <div className="text-xs text-orange-400">+15 mins (safety mode)</div>
          )}
        </div>
      </div>

      {/* Rest Stop Suggestions */}
      {/* {drowsinessLevel !== 'normal' && (
        <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <MapPin className="w-5 h-5 text-blue-400" />
            <h3 className="text-blue-400 font-semibold">Nearby Rest Stops</h3>
          </div>
          <div className="space-y-2">
            {nearbyRestStops.map((stop, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-800/50 rounded p-2">
                <div>
                  <div className="text-white text-sm font-medium">{stop.name}</div>
                  <div className="text-gray-400 text-xs">{stop.distance} ahead</div>
                </div>
                <div className="text-blue-400 text-sm">{stop.time}</div>
              </div>
            ))}
          </div>
        </div> */}
      {/* )} */}

      {/* System Status */}
      <div className="bg-gray-800 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">System Status</span>
          <div className={`flex items-center space-x-2 ${
            drowsinessLevel === 'critical' ? 'text-red-400' :
            drowsinessLevel === 'drowsy' ? 'text-yellow-400' : 'text-green-400'
          }`}>
            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span className="text-sm font-medium">
              {drowsinessLevel === 'critical' ? 'Emergency Mode' :
               drowsinessLevel === 'drowsy' ? 'Safety Mode' : 'Normal Operation'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertSystem;