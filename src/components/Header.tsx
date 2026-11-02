import React, { useState } from 'react';
import { Volume2, VolumeX, Calendar } from 'lucide-react';
import { soundSynth } from '../utils/audio';
import { PWAInstallButton } from './PWAInstallButton';

export type NavTab = 'overview' | 'planner' | 'analytics' | 'mock-exam';

interface HeaderProps {
  targetDate: string;
  onTargetDateChange: (date: string) => void;
  examName: string;
  onExamNameChange: (name: string) => void;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenContact: () => void;
  completedTasksCount: number;
  totalTasksCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  targetDate,
  onTargetDateChange,
  examName,
  onExamNameChange,
  activeTab,
  onTabChange,
  onOpenContact,
  completedTasksCount,
  totalTasksCount,
}) => {
  const [isMuted, setIsMuted] = useState(soundSynth.getMuted());

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundSynth.setMuted(nextMute);
    if (!nextMute) {
      soundSynth.playBell();
    }
  };

  const handlePresetTarget = (name: string, date: string) => {
    onExamNameChange(name);
    onTargetDateChange(date);
    soundSynth.playBeep(650, 150);
  };

  const completionPct = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <header className="border-b border-zinc-800 bg-black/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Zone 1: Clean Brand Wordmark */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-black font-mono font-black text-sm flex items-center justify-center tracking-tighter">
              27
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                <span>JEE 2027</span>
                <span className="text-zinc-500 font-mono text-xs font-normal">/ ACADEMIC COMMAND</span>
              </div>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            <PWAInstallButton />
          </div>
        </div>

        {/* Zone 2: Navigation Links (Clean single-line tabs) */}
        <nav className="flex items-center gap-1 overflow-x-auto max-w-full py-1 text-xs font-mono">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'planner', label: 'Planner & OCR' },
            { id: 'analytics', label: 'Trajectory' },
            { id: 'mock-exam', label: 'Mock Studio' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id as NavTab);
                soundSynth.playBeep(800, 60);
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions Group */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          {/* Target Exam Presets */}
          <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 p-1 rounded-lg text-xs font-mono">
            <button
              onClick={() => handlePresetTarget('JEE Main 2027 (Jan)', '2027-01-24')}
              className={`px-2.5 py-1 rounded transition ${
                targetDate === '2027-01-24'
                  ? 'bg-white text-black font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Main Jan '27
            </button>
            <button
              onClick={() => handlePresetTarget('JEE Advanced 2027', '2027-05-23')}
              className={`px-2.5 py-1 rounded transition ${
                targetDate === '2027-05-23'
                  ? 'bg-white text-black font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Adv May '27
            </button>

            <div className="relative flex items-center pl-1 border-l border-zinc-800">
              <Calendar className="w-3.5 h-3.5 text-zinc-500 absolute left-2 pointer-events-none" />
              <input
                type="date"
                value={targetDate}
                onChange={(e) => onTargetDateChange(e.target.value)}
                className="bg-transparent text-zinc-300 text-xs pl-7 pr-2 py-0.5 focus:outline-none"
                title="Set Custom Exam Date"
              />
            </div>
          </div>

          {/* Audio Synthesizer Toggle */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-lg border text-xs transition ${
              isMuted
                ? 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-zinc-400'
                : 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Support / Contact button */}
          <button
            onClick={onOpenContact}
            className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono transition"
            title="Contact Support: goditor77@gmail.com"
          >
            Support
          </button>

          {/* Android PWA Install Button */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
