import React, { useState, useEffect, useRef } from 'react';
import { Timer, Phone, X, RotateCcw, AlertCircle } from 'lucide-react';

interface SafetyTimerProps {
  isActive: boolean;
  onEmergencyCall: () => void;
  onTimerStop: () => void;
  onTimerReset: () => void;
}

const SafetyTimer: React.FC<SafetyTimerProps> = ({ 
  isActive, 
  onEmergencyCall, 
  onTimerStop, 
  onTimerReset 
}) => {
  const [timeLeft, setTimeLeft] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Emergency contacts for display
  const emergencyContacts = [
    { name: "Emergency Services", number: "911", type: "emergency" },
    { name: "Family Contact", number: "+1-555-0123", type: "family" },
    { name: "Medical Alert", number: "+1-555-0456", type: "medical" }
  ];

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    document.addEventListener('click', initAudio, { once: true });
    return () => {
      document.removeEventListener('click', initAudio);
    };
  }, []);

  // Start timer when activated
  useEffect(() => {
    if (isActive && !isRunning && !hasTriggered) {
      setIsRunning(true);
      setTimeLeft(10);
      playWarningBeep();
    } else if (!isActive) {
      handleStop();
    }
  }, [isActive, isRunning, hasTriggered]);

  // Countdown logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setTimeout(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          
          // Play beep every second
          if (newTime > 0) {
            playCountdownBeep(newTime);
          }
          
          // Trigger emergency call when timer reaches 0
          if (newTime === 0) {
            setIsRunning(false);
            setHasTriggered(true);
            onEmergencyCall();
            playEmergencySound();
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, onEmergencyCall]);

  const playWarningBeep = () => {
    if (!audioContextRef.current) return;

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.frequency.setValueAtTime(1000, audioContextRef.current.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.5);
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  const playCountdownBeep = (secondsLeft: number) => {
    if (!audioContextRef.current) return;

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      // Higher pitch as time runs out
      const frequency = 600 + (10 - secondsLeft) * 100;
      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      gainNode.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.2);

      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.2);
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  const playEmergencySound = () => {
    if (!audioContextRef.current) return;

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.frequency.setValueAtTime(1500, audioContextRef.current.currentTime);
      oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime + 0.3);
      oscillator.frequency.setValueAtTime(1500, audioContextRef.current.currentTime + 0.6);

      gainNode.gain.setValueAtTime(0.4, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 2);

      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 2);
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setTimeLeft(10);
    setHasTriggered(false);
    onTimerStop();
    
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
  };

  const handleReset = () => {
    setTimeLeft(10);
    setHasTriggered(false);
    onTimerReset();
    
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
    
    if (isActive) {
      setIsRunning(true);
      playWarningBeep();
    }
  };

  const getUrgencyLevel = () => {
    if (timeLeft <= 3) return 'critical';
    if (timeLeft <= 6) return 'high';
    return 'medium';
  };

  const urgencyLevel = getUrgencyLevel();
  const progressPercentage = ((10 - timeLeft) / 10) * 100;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center space-x-2">
          <Timer className="w-5 h-5 text-orange-400" />
          <span>Safety Timer</span>
        </h3>
        {hasTriggered && (
          <div className="flex items-center space-x-1 text-red-400">
            <Phone className="w-4 h-4 animate-pulse" />
            <span className="text-xs font-semibold">CALLING</span>
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div className="flex flex-col items-center space-y-4">
        {/* Circular Timer */}
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background Circle */}
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="#374151"
              strokeWidth="8"
              fill="none"
            />
            
            {/* Progress Circle */}
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke={
                urgencyLevel === 'critical' ? '#ef4444' :
                urgencyLevel === 'high' ? '#f59e0b' : '#3b82f6'
              }
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={314.16} // 2 * PI * 50
              strokeDashoffset={314.16 - (progressPercentage / 100) * 314.16}
              className="transition-all duration-1000 ease-linear"
              style={{
                filter: urgencyLevel === 'critical' ? 'drop-shadow(0 0 10px currentColor)' : 'none'
              }}
            />
          </svg>

          {/* Timer Number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-4xl font-bold transition-all duration-300 ${
              urgencyLevel === 'critical' ? 'text-red-400 animate-pulse scale-110' :
              urgencyLevel === 'high' ? 'text-yellow-400' : 'text-blue-400'
            }`}>
              {timeLeft}
            </div>
            <div className="text-gray-400 text-xs">seconds</div>
          </div>

          {/* Pulsing Ring for Critical */}
          {urgencyLevel === 'critical' && isRunning && (
            <div className="absolute inset-0 rounded-full border-4 border-red-400/50 animate-ping" />
          )}
        </div>

        {/* Status Message */}
        <div className="text-center">
          <div className={`text-lg font-bold mb-1 ${
            hasTriggered ? 'text-red-400' :
            isRunning ? 
              (urgencyLevel === 'critical' ? 'text-red-400' :
               urgencyLevel === 'high' ? 'text-yellow-400' : 'text-blue-400') :
              'text-gray-400'
          }`}>
            {hasTriggered ? 'EMERGENCY CALL INITIATED' :
             isRunning ? 'SAFETY TIMER ACTIVE' : 'TIMER READY'}
          </div>
          
          <div className="text-sm text-gray-400">
            {hasTriggered ? 'Contacting emergency services...' :
             isRunning ? 'Press STOP to cancel emergency call' : 'Waiting for activation'}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <div 
            className={`h-full transition-all duration-1000 ease-linear ${
            urgencyLevel === 'critical' ? 'bg-red-400 animate-pulse' :
            urgencyLevel === 'high' ? 'bg-yellow-400' : 'bg-blue-400'
            }`}
            style={{ width: `${progressPercentage}%` }}
        />
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleStop}
            disabled={!isRunning && !hasTriggered}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              isRunning || hasTriggered ?
                'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/25' :
                'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <X className="w-4 h-4" />
            <span>STOP</span>
          </button>

          <button
            onClick={handleReset}
            disabled={!isActive}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              isActive ?
                'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25' :
                'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET</span>
          </button>
        </div>

        {/* Emergency Contacts Display */}
        {(isRunning || hasTriggered) && (
          <div className="w-full bg-gray-900 rounded-lg p-3 border border-gray-600">
            <div className="flex items-center space-x-2 mb-2">
              <Phone className="w-4 h-4 text-green-400" />
              <span className="text-white text-sm font-semibold">Emergency Contacts</span>
            </div>
            <div className="space-y-1">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      hasTriggered ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                    }`} />
                    <span className="text-gray-300">{contact.name}</span>
                  </div>
                  <span className="text-gray-400 font-mono">{contact.number}</span>
                </div>
              ))}
            </div>
            {hasTriggered && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <div className="flex items-center space-x-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold">Calling emergency contacts...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Warning Messages */}
        {isRunning && timeLeft <= 5 && (
          <div className={`w-full p-3 rounded-lg border-2 animate-pulse ${
            timeLeft <= 3 ? 'bg-red-500/20 border-red-400' : 'bg-yellow-500/20 border-yellow-400'
          }`}>
            <div className="flex items-center space-x-2">
              <AlertCircle className={`w-5 h-5 ${
                timeLeft <= 3 ? 'text-red-400 animate-spin' : 'text-yellow-400'
              }`} />
              <div>
                <div className={`font-bold text-sm ${
                  timeLeft <= 3 ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {timeLeft <= 3 ? 'EMERGENCY CALL IMMINENT!' : 'WARNING: Timer Active'}
                </div>
                <div className={`text-xs ${
                  timeLeft <= 3 ? 'text-red-300' : 'text-yellow-300'
                }`}>
                  {timeLeft <= 3 ? 
                    'Emergency services will be called automatically!' :
                    'Press STOP to cancel emergency call'
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {hasTriggered && (
          <div className="w-full p-3 bg-green-500/20 border-2 border-green-400 rounded-lg">
            <div className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-green-400 animate-pulse" />
              <div>
                <div className="text-green-400 font-bold text-sm">Emergency Call Initiated</div>
                <div className="text-green-300 text-xs">
                  Contacting {emergencyContacts.length} emergency numbers
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timer Status Lights */}
      <div className="flex justify-center space-x-2 mt-4">
        <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
          isActive ? 'bg-blue-400 animate-pulse' : 'bg-gray-600'
        }`} title="Timer Armed" />
        <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
          isRunning ? 'bg-yellow-400 animate-pulse' : 'bg-gray-600'
        }`} title="Countdown Active" />
        <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
          hasTriggered ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
        }`} title="Emergency Called" />
      </div>
    </div>
  );
};

export default SafetyTimer;