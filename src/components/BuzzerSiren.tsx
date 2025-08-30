import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface BuzzerSirenProps {
  isActive: boolean;
  emergencyLevel: 'normal' | 'drowsy' | 'critical';
}

const BuzzerSiren: React.FC<BuzzerSirenProps> = ({ 
  isActive, 
  emergencyLevel 
}) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isGlowing, setIsGlowing] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Init audio
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };
    document.addEventListener('click', initAudio, { once: true });
    return () => document.removeEventListener('click', initAudio);
  }, []);

  // Siren control
  useEffect(() => {
    if (isActive && isSoundEnabled && audioContextRef.current) {
      startSiren();
      setIsGlowing(true);
    } else {
      stopSiren();
      setIsGlowing(false);
    }
    return () => stopSiren();
  }, [isActive, isSoundEnabled]);

  const startSiren = () => {
    if (!audioContextRef.current || oscillatorRef.current) return;
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    if (emergencyLevel === 'critical') {
      oscillator.frequency.setValueAtTime(1200, audioContextRef.current.currentTime);
      gainNode.gain.setValueAtTime(0.4, audioContextRef.current.currentTime);
    } else if (emergencyLevel === 'drowsy') {
      oscillator.frequency.setValueAtTime(600, audioContextRef.current.currentTime);
      gainNode.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);
    }

    oscillator.start();
    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;

    setTimeout(() => {
      if (oscillatorRef.current) oscillatorRef.current.stop();
    }, 2000);
  };

  const stopSiren = () => {
    if (oscillatorRef.current) {
      try { oscillatorRef.current.stop(); } catch {}
      oscillatorRef.current = null;
    }
  };

  const toggleSound = () => setIsSoundEnabled(!isSoundEnabled);

  // Tailwind-safe class mapping
  const colorClasses: Record<string, string> = {
    red: "border-red-400 bg-red-500/30",
    yellow: "border-yellow-400 bg-yellow-500/30",
    gray: "border-gray-600 bg-gray-700",
  };

  const sirenColor =
    emergencyLevel === 'critical' ? 'red' :
    emergencyLevel === 'drowsy' ? 'yellow' : 'gray';

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center space-x-2">
          <span>🚨</span>
          <span>Emergency Siren</span>
        </h3>
        <button onClick={toggleSound} className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
          {isSoundEnabled ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
        </button>
      </div>

      {/* Siren Visual */}
      <div className="flex items-center justify-center mb-4">
        <div
          className={`relative w-24 h-24 rounded-full border-4 
            ${isActive && isGlowing ? colorClasses[sirenColor] : colorClasses.gray} 
            ${isActive ? 'animate-pulse' : ''}`}
        >
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            {emergencyLevel === 'critical' ? '⚠' : emergencyLevel === 'drowsy' ? '🔔' : '✅'}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="text-center">
        <div className={`text-lg font-bold mb-1 ${
          isActive 
            ? sirenColor === 'red' ? 'text-red-400' : 'text-yellow-400' 
            : 'text-gray-400'
        }`}>
          {isActive 
            ? (emergencyLevel === 'critical' ? 'EMERGENCY' : 'WARNING') 
            : 'STANDBY'}
        </div>
      </div>
    </div>
  );
};

export default BuzzerSiren;
