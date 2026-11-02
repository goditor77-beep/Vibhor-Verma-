import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell, Clock, ShieldAlert } from 'lucide-react';
import { soundSynth } from '../utils/audio';

interface TimerAndAlarmProps {
  onSessionComplete?: (minutes: number) => void;
}

export const TimerAndAlarm: React.FC<TimerAndAlarmProps> = ({ onSessionComplete }) => {
  // Timer State
  const [timerMinutes, setTimerMinutes] = useState(60);
  const [secondsLeft, setSecondsLeft] = useState(60 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [enableTickSound, setEnableTickSound] = useState(false);

  // Daily Alarm State
  const [alarmTime, setAlarmTime] = useState<string>(() => localStorage.getItem('jee_daily_alarm') || '06:00');
  const [alarmEnabled, setAlarmEnabled] = useState<boolean>(() => localStorage.getItem('jee_alarm_enabled') === 'true');
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  const alarmFiredRef = useRef<string | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotification = async () => {
    if ('Notification' in window) {
      const res = await Notification.requestPermission();
      setNotificationPermission(res);
      if (res === 'granted') {
        soundSynth.playBell();
      }
    }
  };

  useEffect(() => {
    localStorage.setItem('jee_daily_alarm', alarmTime);
    localStorage.setItem('jee_alarm_enabled', String(alarmEnabled));
  }, [alarmTime, alarmEnabled]);

  // Check Alarm
  useEffect(() => {
    const checkAlarm = () => {
      if (!alarmEnabled || !alarmTime) return;

      const now = new Date();
      const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      if (currentHM === alarmTime && now.getSeconds() === 0 && alarmFiredRef.current !== currentHM) {
        alarmFiredRef.current = currentHM;
        triggerAlarmAlert();
      }
    };

    const interval = setInterval(checkAlarm, 1000);
    return () => clearInterval(interval);
  }, [alarmEnabled, alarmTime]);

  const triggerAlarmAlert = () => {
    setIsAlarmRinging(true);
    soundSynth.startAlarm();

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('JEE Study Alarm', {
          body: 'Scheduled study session starting now. Focus is non-negotiable.',
          icon: '/pwa-192x192.png',
        });
      } catch (e) {}
    }
  };

  const stopRingingAlarm = () => {
    setIsAlarmRinging(false);
    soundSynth.stopAlarm();
  };

  // Timer Tick
  useEffect(() => {
    let interval: any = null;

    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          if (enableTickSound && prev % 2 === 0) {
            soundSynth.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, enableTickSound]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    soundSynth.playVictory();
    triggerAlarmAlert();
    onSessionComplete?.(timerMinutes);
  };

  const setPreset = (mins: number) => {
    setTimerMinutes(mins);
    setSecondsLeft(mins * 60);
    setIsRunning(false);
    soundSynth.playBeep(520, 100);
  };

  const toggleTimer = () => {
    if (!isRunning) soundSynth.playBell();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(timerMinutes * 60);
    soundSynth.playBeep(400, 100);
  };

  const addTime = (mins: number) => {
    setSecondsLeft((prev) => prev + mins * 60);
    soundSynth.playBeep(700, 100);
  };

  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalDuration = timerMinutes * 60;
  const progressPercent = totalDuration > 0 ? ((totalDuration - secondsLeft) / totalDuration) * 100 : 0;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
      {/* Alarm Alert Modal */}
      {isAlarmRinging && (
        <div className="p-4 bg-zinc-900 border border-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-white" />
            <div>
              <div className="font-bold text-sm text-white">Scheduled JEE Study Session Active</div>
              <div className="text-xs text-zinc-400">Scheduled time reached. Begin your focus block.</div>
            </div>
          </div>
          <button
            onClick={stopRingingAlarm}
            className="px-5 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 transition"
          >
            Dismiss Alarm
          </button>
        </div>
      )}

      {/* Main Grid: Focus Timer on left (7 cols), Daily Alarm on right (5 cols) */}
      <div className="grid md:grid-cols-12 gap-6 items-stretch">
        {/* Left Timer */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Session Timer</h3>

            {/* Presets */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg text-xs font-mono">
              {[25, 60, 90].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setPreset(mins)}
                  className={`px-3 py-1 rounded transition ${
                    timerMinutes === mins ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Digital Display */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 text-center">
            <div className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-white tabular-nums">
              {formatTime(secondsLeft)}
            </div>

            <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden mt-4">
              <div
                className="bg-white h-full transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTimer}
                className={`px-6 py-2.5 rounded-lg font-semibold text-xs transition flex items-center gap-2 ${
                  isRunning
                    ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
                    : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Session</span>
                  </>
                )}
              </button>

              <button
                onClick={resetTimer}
                className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => addTime(5)}
                className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono transition"
              >
                +5m
              </button>
            </div>

            <button
              onClick={() => setEnableTickSound(!enableTickSound)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition ${
                enableTickSound
                  ? 'bg-zinc-800 border-zinc-600 text-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-400'
              }`}
            >
              Tick: {enableTickSound ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Right Alarm */}
        <div className="md:col-span-5 bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-white" />
                <h4 className="font-bold text-xs text-white uppercase tracking-wider font-mono">
                  Daily Revision Alarm
                </h4>
              </div>

              <button
                onClick={() => setAlarmEnabled(!alarmEnabled)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  alarmEnabled ? 'bg-white' : 'bg-zinc-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                    alarmEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mt-1">
              Rings acoustic synthesis chime at exact set time daily.
            </p>

            <div className="mt-4 bg-zinc-950 border border-zinc-800 p-3 rounded-lg flex items-center justify-between gap-3">
              <input
                type="time"
                value={alarmTime}
                onChange={(e) => setAlarmTime(e.target.value)}
                className="bg-transparent text-white font-mono text-xl font-bold focus:outline-none"
              />
              <button
                onClick={() => soundSynth.startAlarm(() => setTimeout(stopRingingAlarm, 2500))}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono rounded-lg transition"
              >
                Test Sound
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>Status:</span>
            <span className={alarmEnabled ? 'text-white font-bold' : 'text-zinc-600'}>
              {alarmEnabled ? `ACTIVE (${alarmTime})` : 'DISABLED'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
