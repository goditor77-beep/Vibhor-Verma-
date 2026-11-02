import React, { useState } from 'react';
import { MockTestAttempt } from '../types/jee';
import { INITIAL_MOCK_TESTS } from '../data/sampleSchedules';
import { Clock, Play, Pause, RotateCcw, Plus, Trash2, Award, AlertCircle, BarChart3, ShieldCheck } from 'lucide-react';
import { soundSynth } from '../utils/audio';

interface MockExamStudioProps {
  onSessionComplete?: (mins: number) => void;
}

export const MockExamStudio: React.FC<MockExamStudioProps> = ({ onSessionComplete }) => {
  // 180 Minute Exam Timer State
  const [examSecondsLeft, setExamSecondsLeft] = useState(180 * 60);
  const [isExamRunning, setIsExamRunning] = useState(false);
  const [currentSection, setCurrentSection] = useState<'Physics' | 'Chemistry' | 'Mathematics'>('Physics');

  // Mock Tests History State
  const [mockTests, setMockTests] = useState<MockTestAttempt[]>(() => {
    try {
      const stored = localStorage.getItem('jee_mock_tests');
      return stored ? JSON.parse(stored) : INITIAL_MOCK_TESTS;
    } catch {
      return INITIAL_MOCK_TESTS;
    }
  });

  // New Mock Test Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [testName, setTestName] = useState('');
  const [phyMarks, setPhyMarks] = useState<number>(75);
  const [chemMarks, setChemMarks] = useState<number>(70);
  const [mathMarks, setMathMarks] = useState<number>(55);
  const [negativesLost, setNegativesLost] = useState<number>(8);

  // Timer loop for 180m mock
  React.useEffect(() => {
    let interval: any = null;
    if (isExamRunning && examSecondsLeft > 0) {
      interval = setInterval(() => {
        setExamSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsExamRunning(false);
            soundSynth.startAlarm();
            onSessionComplete?.(180);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isExamRunning, examSecondsLeft]);

  // Sync to localStorage
  React.useEffect(() => {
    localStorage.setItem('jee_mock_tests', JSON.stringify(mockTests));
  }, [mockTests]);

  const toggleExamTimer = () => {
    if (!isExamRunning) {
      soundSynth.playBell();
    }
    setIsExamRunning(!isExamRunning);
  };

  const resetExamTimer = () => {
    setIsExamRunning(false);
    setExamSecondsLeft(180 * 60);
    soundSynth.playBeep(440, 100);
  };

  // Calculate projected percentile from total score based on JEE Main historical normalization
  const calculatePercentile = (total: number) => {
    if (total >= 280) return 99.98;
    if (total >= 250) return 99.85;
    if (total >= 220) return 99.5;
    if (total >= 190) return 98.8;
    if (total >= 160) return 97.2;
    if (total >= 130) return 94.5;
    if (total >= 100) return 90.0;
    return Math.max(50, Math.round((total / 100) * 85));
  };

  const handleSaveMockTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) return;

    const total = Number(phyMarks) + Number(chemMarks) + Number(mathMarks);
    const percentile = calculatePercentile(total);

    const newAttempt: MockTestAttempt = {
      id: `mock-${Date.now()}`,
      testName,
      date: new Date().toISOString().split('T')[0],
      physicsScore: Number(phyMarks),
      chemScore: Number(chemMarks),
      mathsScore: Number(mathMarks),
      totalScore: total,
      negativeMarksLost: Number(negativesLost),
      projectedPercentile: percentile,
    };

    setMockTests([newAttempt, ...mockTests]);
    setTestName('');
    setShowAddForm(false);
    soundSynth.playVictory();
  };

  const handleDeleteMock = (id: string) => {
    setMockTests(mockTests.filter((m) => m.id !== id));
    soundSynth.playBeep(400, 100);
  };

  // Format seconds to HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalTimeSpentSec = 180 * 60 - examSecondsLeft;
  const progressPct = Math.round((totalTimeSpentSec / (180 * 60)) * 100);

  // Averages
  const avgScore = mockTests.length
    ? Math.round(mockTests.reduce((acc, m) => acc + m.totalScore, 0) / mockTests.length)
    : 0;
  const avgNegatives = mockTests.length
    ? Math.round(mockTests.reduce((acc, m) => acc + m.negativeMarksLost, 0) / mockTests.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* 3-Hour Exam Simulation Console */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="text-xs uppercase tracking-wider font-mono text-zinc-400">
              Official 3-Hour Standard
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              JEE Main Full Syllabus Exam Simulator
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Simulates exact NTA exam conditions: 75 questions, 300 marks, strict 180-minute countdown.
            </p>
          </div>

          {/* Sectional Strategy Pill */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg text-xs font-mono">
            {(['Physics', 'Chemistry', 'Mathematics'] as const).map((sec) => (
              <button
                key={sec}
                onClick={() => setCurrentSection(sec)}
                className={`px-3 py-1.5 rounded font-medium transition ${
                  currentSection === sec
                    ? 'bg-white text-black font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        {/* Digital Clock Display */}
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <div className="text-6xl sm:text-7xl font-mono font-bold tracking-tight text-white tabular-nums">
            {formatTime(examSecondsLeft)}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span>Elapsed: {Math.floor(totalTimeSpentSec / 60)}m ({progressPct}%)</span>
            <span>·</span>
            <span>Recommended Section Time: {currentSection === 'Chemistry' ? '40-45m' : currentSection === 'Physics' ? '55-60m' : '75-80m'}</span>
          </div>

          {/* Full-width hairline progress bar */}
          <div className="w-full max-w-xl bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-6">
            <div
              className="bg-white h-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Exam Controls */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={toggleExamTimer}
              className={`px-6 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition flex items-center gap-2 ${
                isExamRunning
                  ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              {isExamRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isExamRunning ? 'Pause Exam' : 'Start 3-Hour Simulation'}</span>
            </button>

            <button
              onClick={resetExamTimer}
              className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition"
              title="Reset Exam Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mock Test Scoreboard & Analytics */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h3 className="text-base font-bold text-white">Mock Test Performance & Percentile Tracker</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Record full mock tests to track subject balance and eliminate negative marking leaks.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Mock Test</span>
          </button>
        </div>

        {/* Quick KPI Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Tests Completed</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">{mockTests.length}</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Average Score</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">{avgScore} / 300</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Avg Negative Penalty</div>
            <div className="text-2xl font-bold font-mono text-zinc-300 mt-1">-{avgNegatives} Marks</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Estimated Percentile</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {mockTests.length ? `${mockTests[0].projectedPercentile}%ile` : '—'}
            </div>
          </div>
        </div>

        {/* Log New Mock Modal / Card */}
        {showAddForm && (
          <form onSubmit={handleSaveMockTest} className="bg-zinc-900 border border-zinc-700/80 p-5 rounded-xl space-y-4">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Enter Official Mock Test Results
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-mono block mb-1">Test Name or Shift Paper</label>
              <input
                type="text"
                required
                placeholder="e.g. Allen Major Test 03 or JEE Main 2024 Jan 27 S1"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 font-mono block mb-1">Physics (/100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={phyMarks}
                  onChange={(e) => setPhyMarks(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs rounded-lg px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 font-mono block mb-1">Chemistry (/100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={chemMarks}
                  onChange={(e) => setChemMarks(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs rounded-lg px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 font-mono block mb-1">Mathematics (/100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={mathMarks}
                  onChange={(e) => setMathMarks(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs rounded-lg px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 font-mono block mb-1">Negative Marks Lost</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={negativesLost}
                  onChange={(e) => setNegativesLost(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs rounded-lg px-3 py-2 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-white text-black font-semibold text-xs rounded-lg hover:bg-zinc-200 transition"
              >
                Save Score
              </button>
            </div>
          </form>
        )}

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-mono text-[11px]">
                <th className="py-2.5 px-3">Test Title</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Physics</th>
                <th className="py-2.5 px-3">Chemistry</th>
                <th className="py-2.5 px-3">Maths</th>
                <th className="py-2.5 px-3">Total Score</th>
                <th className="py-2.5 px-3">Negatives</th>
                <th className="py-2.5 px-3">Est. %ile</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 font-mono">
              {mockTests.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-900/40 transition">
                  <td className="py-3 px-3 font-semibold text-white font-sans">{item.testName}</td>
                  <td className="py-3 px-3 text-zinc-400">{item.date}</td>
                  <td className="py-3 px-3 text-zinc-200">{item.physicsScore}</td>
                  <td className="py-3 px-3 text-zinc-200">{item.chemScore}</td>
                  <td className="py-3 px-3 text-zinc-200">{item.mathsScore}</td>
                  <td className="py-3 px-3 font-bold text-white">{item.totalScore} / 300</td>
                  <td className="py-3 px-3 text-zinc-400">-{item.negativeMarksLost}</td>
                  <td className="py-3 px-3 text-white font-bold">{item.projectedPercentile}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleDeleteMock(item.id)}
                      className="text-zinc-500 hover:text-zinc-200 transition p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
