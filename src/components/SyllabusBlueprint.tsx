import React, { useState } from 'react';
import { HIGH_YIELD_BLUEPRINT } from '../data/sampleSchedules';
import { BookMarked, ChevronDown, ChevronUp, Star, Flame, Award } from 'lucide-react';

export const SyllabusBlueprint: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
              <span>JEE 2027 High-Yield Weightage Matrix & Syllabus Radar</span>
              <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full">
                Kota Blueprint
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical NTA trend analysis: chapters contributing &gt;65% of JEE Main score
            </p>
          </div>
        </div>

        <button className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="pt-3 border-t border-slate-800/80 grid md:grid-cols-3 gap-4">
          {HIGH_YIELD_BLUEPRINT.map((subj) => (
            <div
              key={subj.subject}
              className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span
                  className={`font-black text-sm ${
                    subj.subject === 'Physics'
                      ? 'text-sky-400'
                      : subj.subject === 'Chemistry'
                      ? 'text-emerald-400'
                      : 'text-purple-400'
                  }`}
                >
                  {subj.subject}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {subj.weightage} of Paper
                </span>
              </div>

              <div className="space-y-2">
                {subj.topics.map((topic, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{topic.name}</span>
                      <span className="text-[9px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        {topic.class}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="text-amber-400/90 font-mono text-[10px] flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-400" />
                        {topic.pyqFreq}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          topic.weight === 'Very High' || topic.weight === 'Score Booster'
                            ? 'text-emerald-400 bg-emerald-950/60'
                            : 'text-cyan-400 bg-cyan-950/60'
                        }`}
                      >
                        {topic.weight}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
