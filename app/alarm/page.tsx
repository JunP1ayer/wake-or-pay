'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Bell, X, CheckCircle } from 'lucide-react';

export default function AlarmPage() {
  const [alarmTime, setAlarmTime] = useState('');
  const [isAlarmSet, setIsAlarmSet] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [hasTriggered, setHasTriggered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  const playAlarm = useCallback(async () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/alarm.mp3');
      }
      
      await audioRef.current.play();
      
      setTimeout(() => {
        router.push('/face');
      }, 2000);
    } catch (error) {
      console.error('Failed to play alarm sound:', error);
      alert('Alarm triggered but could not play sound. Redirecting to face recognition...');
      router.push('/face');
    }
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeString = now.toTimeString().slice(0, 5);
      setCurrentTime(timeString);

      if (isAlarmSet && alarmTime && !hasTriggered) {
        if (timeString === alarmTime) {
          setHasTriggered(true);
          playAlarm();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAlarmSet, alarmTime, hasTriggered, playAlarm]);

  const handleSetAlarm = () => {
    if (alarmTime) {
      setIsAlarmSet(true);
      setHasTriggered(false);
    }
  };

  const handleCancelAlarm = () => {
    setIsAlarmSet(false);
    setHasTriggered(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Wake Up Alarm
          </h1>
          <p className="text-gray-600">
            Set your personal wake-up alarm
          </p>
        </div>

        {/* Current Time Display */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-5xl font-mono font-bold text-gray-900 mb-2">
            {currentTime || '--:--'}
          </div>
          <p className="text-gray-500 text-sm">
            Current Time
          </p>
        </div>

        {/* Alarm Settings Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div className="space-y-3">
            <label htmlFor="alarm-time" className="block text-sm font-semibold text-gray-700">
              Set Alarm Time
            </label>
            <input
              id="alarm-time"
              type="time"
              value={alarmTime}
              onChange={(e) => setAlarmTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-xl font-mono text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isAlarmSet}
            />
          </div>

          <div className="flex gap-3">
            {!isAlarmSet ? (
              <button
                onClick={handleSetAlarm}
                disabled={!alarmTime}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                <Bell className="w-5 h-5" />
                Set Alarm
              </button>
            ) : (
              <button
                onClick={handleCancelAlarm}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium"
              >
                <X className="w-5 h-5" />
                Cancel Alarm
              </button>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {isAlarmSet && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-green-800 font-medium">
                  Alarm Active
                </p>
                <p className="text-green-700 text-sm">
                  Set for {alarmTime} - Stay awake!
                </p>
              </div>
            </div>
          </div>
        )}

        {hasTriggered && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-yellow-800 font-medium">
                  Alarm Triggered!
                </p>
                <p className="text-yellow-700 text-sm">
                  Redirecting to verification...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}