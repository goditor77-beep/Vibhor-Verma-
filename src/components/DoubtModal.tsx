import React, { useState } from 'react';
import { X, Loader2, Lightbulb, AlertOctagon, Zap } from 'lucide-react';
import { Task } from '../types/jee';
import { soundSynth } from '../utils/audio';

interface DoubtModalProps {
  task: Task | null;
  onClose: () => void;
}

export const DoubtModal: React.FC<DoubtModalProps> = ({ task, onClose }) => {
  const [customQuestion, setCustomQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!task) return null;

  const handleAskAI = async (queryText?: string) => {
    const q =
      queryText ||
      customQuestion ||
      `What are the core formulas, high-yield traps, and speed-solving shortcuts for ${task.topic}?`;
    setLoading(true);
    setError(null);
    soundSynth.playBell();

    try {
      const res = await fetch('/api/quick-doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: task.subject,
          topic: task.topic,
          query: q,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch AI explanation.');
      }

      setAnswer(data.answer);
      soundSynth.playVictory();
    } catch (err: any) {
      setError(err.message || 'Error fetching guidance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-start justify-between gap-3 bg-zinc-900/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="font-semibold text-white">{task.subject}</span>
              <span>·</span>
              <span>{task.estimatedMinutes}m</span>
              <span>·</span>
              <span>{task.difficulty || 'Target'}</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">{task.topic}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">{task.targetDetails}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 font-mono text-xs">
          {!answer && !loading && (
            <div className="space-y-3">
              <div className="text-zinc-400 font-sans text-xs">
                Select a tactical focus for this chapter:
              </div>
              <div className="grid gap-2">
                <button
                  onClick={() =>
                    handleAskAI('Explain the top 3 formulas and standard problem traps in JEE Main & Advanced for this topic.')
                  }
                  className="text-left p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-xs text-zinc-200 transition flex items-center gap-3 font-sans"
                >
                  <Lightbulb className="w-4 h-4 text-white shrink-0" />
                  <span>Formulas & NTA Examiner Traps (Fast Formula Summary)</span>
                </button>
                <button
                  onClick={() =>
                    handleAskAI('What is the 2-minute shortcut trick or elimination technique for this topic in JEE?')
                  }
                  className="text-left p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-xs text-zinc-200 transition flex items-center gap-3 font-sans"
                >
                  <Zap className="w-4 h-4 text-white shrink-0" />
                  <span>2-Minute Speed Solving & Elimination Method</span>
                </button>
                <button
                  onClick={() =>
                    handleAskAI('What are common silly mistakes students make in this chapter and how to avoid negative marking?')
                  }
                  className="text-left p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-xs text-zinc-200 transition flex items-center gap-3 font-sans"
                >
                  <AlertOctagon className="w-4 h-4 text-white shrink-0" />
                  <span>Negative Marking Avoidance & Common Traps</span>
                </button>
              </div>

              {/* Custom question */}
              <div className="pt-2 font-sans">
                <label className="text-[11px] text-zinc-400 font-mono block mb-1">
                  Or ask a specific doubt
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder="e.g. How to find tension cutoff in vertical circle?"
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAskAI();
                    }}
                  />
                  <button
                    onClick={() => handleAskAI()}
                    className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-lg hover:bg-zinc-200 transition"
                  >
                    Ask AI
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
              <div className="text-xs text-white">
                Gemini 3.8 Flash analyzing topic for JEE 2027...
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300 text-xs font-sans">
              {error}
            </div>
          )}

          {answer && (
            <div className="space-y-4">
              <div className="bg-zinc-900/70 border border-zinc-800 p-4 rounded-xl text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed font-sans">
                {answer}
              </div>

              <div className="flex justify-end gap-2 font-sans">
                <button
                  onClick={() => {
                    setAnswer(null);
                    setCustomQuestion('');
                  }}
                  className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs hover:text-white transition"
                >
                  Ask Another
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
