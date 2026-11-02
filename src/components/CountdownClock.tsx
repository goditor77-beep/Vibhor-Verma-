import React, { useEffect, useState } from 'react';
import { CountdownTime } from '../types/jee';
import { MOTIVATIONAL_QUOTES } from '../data/sampleSchedules';
import { RefreshCw } from 'lucide-react';

interface CountdownClockProps {
  targetDate: string;
  examName: string;
}

export const CountdownClock: React.FC<CountdownClockProps> = ({ targetDate, examName }) => {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMs: 0,
  });

  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const calculateTime = () => {
      const targetTime = new Date(`${targetDate}T09:00:00`).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, totalMs: diff });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const cycleQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex];
  const estimatedStudyHoursLeft = timeLeft.days * 8 + Math.floor(timeLeft.hours / 3);

  return (
    <div className="space-y-4">
      {/* Target status bar: Unboxed clean metadata (Zero-Pill discipline) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-950 border border-zinc-800 px-5 py-3.5 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <span className="text-white font-semibold">{examName}</span>
          <span aria-hidden="true">·</span>
          <span>Shift 1 (09:00 AM IST)</span>
          <span aria-hidden="true">·</span>
          <span className="text-zinc-500">
            {new Date(`${targetDate}T09:00:00`).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        <div className="text-xs font-mono text-zinc-400">
          <span className="text-white font-bold">{estimatedStudyHoursLeft.toLocaleString()}</span> study hours remaining
        </div>
      </div>

      {/* Monochrome Architectural Countdown Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'DAYS LEFT', value: String(timeLeft.days).padStart(3, '0') },
          { label: 'HOURS', value: String(timeLeft.hours).padStart(2, '0') },
          { label: 'MINUTES', value: String(timeLeft.minutes).padStart(2, '0') },
          { label: 'SECONDS', value: String(timeLeft.seconds).padStart(2, '0') },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl flex flex-col justify-between hover:border-zinc-700 transition"
          >
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              {item.label}
            </div>

            <div className="py-2">
              <div className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-white tabular-nums">
                {item.value}
              </div>
            </div>

            <div className="border-t border-zinc-900 pt-2 text-[10px] text-zinc-500 font-mono">
              PRECISION TIMER
            </div>
          </div>
        ))}
      </div>

      {/* Motivational Quote Banner */}
      <div className="bg-zinc-950/80 border border-zinc-800/80 px-4 py-3 rounded-xl flex items-center justify-between gap-3 text-xs">
        <p className="text-zinc-300 italic truncate font-sans">
          &ldquo;{currentQuote.quote}&rdquo; — <span className="text-zinc-500 not-italic">{currentQuote.author}</span>
        </p>
        <button
          onClick={cycleQuote}
          className="shrink-0 p-1.5 rounded text-zinc-500 hover:text-white hover:bg-zinc-900 transition"
          title="Next Quote"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
