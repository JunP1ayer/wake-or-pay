'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Bell, X, CheckCircle, Volume2 } from 'lucide-react';
import { stopAlarmAudio } from '@/lib/alarm';

export default function AlarmPage() {
  const [currentTime, setCurrentTime] = useState('');
  const [isAlarmTriggered, setIsAlarmTriggered] = useState(false);
  const router = useRouter();

  const handleStopAlarm = useCallback(() => {
    // Stop the alarm audio
    stopAlarmAudio();
    
    // Redirect to face verification
    router.push('/face');
  }, [router]);

  useEffect(() => {
    // Update current time every second
    const interval = setInterval(() => {
      const now = new Date();
      const timeString = now.toTimeString().slice(0, 5);
      setCurrentTime(timeString);
    }, 1000);

    // Check if we're on this page because alarm was triggered
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('triggered') === 'true') {
      setIsAlarmTriggered(true);
    }

    return () => clearInterval(interval);
  }, []);

  const handleGoToVerification = () => {
    // Stop alarm and go to face verification
    stopAlarmAudio();
    router.push('/face');
  };

  const handleGoHome = () => {
    // Stop alarm and go home
    stopAlarmAudio();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            isAlarmTriggered ? 'bg-red-100 animate-pulse' : 'bg-blue-100'
          }`}>
            {isAlarmTriggered ? (
              <Volume2 className="w-8 h-8 text-red-600" />
            ) : (
              <Clock className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isAlarmTriggered ? '🚨 Wake Up!' : 'Wake Up Alarm'}
          </h1>
          <p className="text-gray-600">
            {isAlarmTriggered ? 'Time to prove you\'re awake!' : 'Your alarm is ready'}
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

        {/* Action Card */}
        {isAlarmTriggered ? (
          <div className="bg-red-50 border border-red-200 rounded-xl shadow-lg p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-800 mb-2">
                Alarm is Ringing!
              </h2>
              <p className="text-red-600 mb-6">
                Complete face verification to stop the alarm and avoid the penalty.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleGoToVerification}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium text-lg"
              >
                <CheckCircle className="w-6 h-6" />
                Stop Alarm & Verify I'm Awake
              </button>
              
              <button
                onClick={handleStopAlarm}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium"
              >
                <X className="w-5 h-5" />
                Just Stop Alarm (Skip Verification)
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Alarm Ready
              </h2>
              <p className="text-gray-600">
                Your alarm has been scheduled. When it triggers, you'll be redirected here automatically.
              </p>
            </div>
            
            <button
              onClick={handleGoHome}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
            >
              <Clock className="w-5 h-5" />
              Back to Dashboard
            </button>
          </div>
        )}

        {/* Status Message */}
        {isAlarmTriggered && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-yellow-600 animate-bounce" />
              <div>
                <p className="text-yellow-800 font-medium">
                  Alarm Audio Playing
                </p>
                <p className="text-yellow-700 text-sm">
                  The alarm will continue until you complete verification or stop it manually.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Message */}
        {!isAlarmTriggered && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="text-center">
              <p className="text-blue-800 text-sm">
                💡 <strong>Tip:</strong> When your alarm triggers, you'll be automatically redirected to this page. 
                The alarm will play until you complete face verification.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}