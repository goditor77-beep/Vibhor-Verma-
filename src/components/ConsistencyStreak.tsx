import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle2, Circle, Trophy, Award, Calendar, ChevronRight, Zap } from 'lucide-react';
import { soundSynth } from '../utils/audio';
import confetti from 'canvas-confetti';

interface ConsistencyStreakProps {
  completedTasksCount: number;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  activeDaysThisWeek: Record<number, boolean>; // 0 (Sun) to 6 (Sat)
  weeklyHoursLogged: number;
}

export const ConsistencyStreak: React.FC<ConsistencyStreakProps> = ({ completedTasksCount }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentDayIndex = new Date().getDay(); // 0-6

  const [streakData, setStreakData] = useState<StreakData>(() => {
    try {
      const stored = localStorage.getItem('jee_streak_data');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    // Default initial streak data
    return {
      currentStreak: 14,
      longestStreak: 21,
      lastActiveDate: todayStr,
      activeDaysThisWeek: {
        1: true, // Mon
        2: true, // Tue
        3: true, // Wed
        4: true, // Thu
        5: true, // Fri
        6: true, // Sat
        0: true, // Sun
      },
      weeklyHoursLogged: 42.5,
    };
  });

  // Automatically mark today active when user completes tasks
  useEffect(() => {
    if (completedTasksCount > 0) {
      setStreakData((prev) => {
        const isTodayActive = prev.activeDaysThisWeek[currentDayIndex];
        if (!isTodayActive || prev.lastActiveDate !== todayStr) {
          const next = {
            ...prev,
            lastActiveDate: todayStr,
            activeDaysThisWeek: {
              ...prev.activeDaysThisWeek,
              [currentDayIndex]: true,
            },
          };
          localStorage.setItem('jee_streak_data', JSON.stringify(next));
          return next;
        }
        return prev;
      });
    }
  }, [completedTasksCount, currentDayIndex, todayStr]);

  const handleManualCheckIn = () => {
    setStreakData((prev) => {
      const isAlreadyActiveToday = prev.activeDaysThisWeek[currentDayIndex];
      const newStreak = isAlreadyActiveToday ? prev.currentStreak : prev.currentStreak + 1;
      const newLongest = Math.max(newStreak, prev.longestStreak);

      const updated: StreakData = {
        ...prev,
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActiveDate: todayStr,
        activeDaysThisWeek: {
          ...prev.activeDaysThisWeek,
          [currentDayIndex]: true,
        },
        weeklyHoursLogged: Math.round((prev.weeklyHoursLogged + 2.5) * 10) / 10,
      };

      localStorage.setItem('jee_streak_data', JSON.stringify(updated));
      return updated;
    });

    soundSynth.playVictory();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#ffffff', '#a1a1aa'],
    });
  };

  const isTodayCompleted = streakData.activeDaysThisWeek[currentDayIndex] || completedTasksCount > 0;

  // Day labels: Mon, Tue, Wed, Thu, Fri, Sat, Sun
  const weekDays = [
    { label: 'M', dayIndex: 1, name: 'Mon' },
    { label: 'T', dayIndex: 2, name: 'Tue' },
    { label: 'W', dayIndex: 3, name: 'Wed' },
    { label: 'T', dayIndex: 4, name: 'Thu' },
    { label: 'F', dayIndex: 5, name: 'Fri' },
    { label: 'S', dayIndex: 6, name: 'Sat' },
    { label: 'S', dayIndex: 0, name: 'Sun' },
  ];

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shrink-0">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-mono text-zinc-400">
              Discipline Engine
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">Consistency Streak</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Unbroken daily problem-solving chains. The single highest predictor of IIT selection.
            </p>
          </div>
        </div>

        {/* Check-In / Action */}
        <button
          onClick={handleManualCheckIn}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
            isTodayCompleted
              ? 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white'
              : 'bg-white text-black hover:bg-zinc-200 shadow-sm'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isTodayCompleted ? 'Completed for Today' : 'Log Daily Study Target'}</span>
        </button>
      </div>

      {/* Grid: Big Numbers on Left, 7-Day Matrix on Right */}
      <div className="grid md:grid-cols-12 gap-6 items-center">
        {/* Left: Streak Figures (5 cols) */}
        <div className="md:col-span-5 grid grid-cols-2 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
            <div className="text-[11px] font-mono text-zinc-400 uppercase">Current Streak</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black font-mono text-white tabular-nums">
                {streakData.currentStreak}
              </span>
              <span className="text-xs text-zinc-400 font-mono">Days</span>
            </div>
            <div className="text-[10px] text-zinc-500 font-mono mt-1">
              {isTodayCompleted ? 'Active today · Unbroken' : 'Pending 1 module today'}
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
            <div className="text-[11px] font-mono text-zinc-400 uppercase">Longest Chain</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black font-mono text-white tabular-nums">
                {streakData.longestStreak}
              </span>
              <span className="text-xs text-zinc-400 font-mono">Days</span>
            </div>
            <div className="text-[10px] text-zinc-500 font-mono mt-1">Personal Best Record</div>
          </div>
        </div>

        {/* Right: 7-Day Rolling Streak Matrix (7 cols) */}
        <div className="md:col-span-7 bg-zinc-900/30 border border-zinc-800 p-4 sm:p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="text-white font-semibold">This Week's Discipline</span>
            <span>{streakData.weeklyHoursLogged}h logged</span>
          </div>

          {/* 7 Days Circles */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((d) => {
              const isToday = d.dayIndex === currentDayIndex;
              const isDone = streakData.activeDaysThisWeek[d.dayIndex];

              return (
                <div
                  key={d.name}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition ${
                    isToday
                      ? 'border-white bg-zinc-900'
                      : isDone
                      ? 'border-zinc-700 bg-zinc-950'
                      : 'border-zinc-800/80 bg-zinc-950/40 opacity-50'
                  }`}
                >
                  <span className="text-[10px] font-mono text-zinc-400 mb-1">{d.name}</span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isDone
                        ? 'bg-white text-black'
                        : isToday
                        ? 'border border-dashed border-zinc-400 text-zinc-300'
                        : 'bg-zinc-900 text-zinc-600'
                    }`}
                  >
                    {isDone ? '✓' : d.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-1 text-[11px] text-zinc-400 font-sans leading-relaxed">
            <span className="text-white font-semibold">Kota Principle:</span> Daily consistency beats 14-hour weekend cramming. Solving 25 questions every day compounds into 18,000+ solved problems before JEE 2027.
          </div>
        </div>
      </div>
    </div>
  );
};
