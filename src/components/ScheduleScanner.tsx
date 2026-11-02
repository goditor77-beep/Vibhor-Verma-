import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, BookOpen, Check, AlertCircle, Loader2, X } from 'lucide-react';
import { JEEPlan } from '../types/jee';
import { SAMPLE_JEE_PLANS } from '../data/sampleSchedules';
import { soundSynth } from '../utils/audio';

interface ScheduleScannerProps {
  onPlanLoaded: (plan: JEEPlan) => void;
  activePlanTitle?: string;
}

export const ScheduleScanner: React.FC<ScheduleScannerProps> = ({ onPlanLoaded, activePlanTitle }) => {
  const [activeTab, setActiveTab] = useState<'ocr' | 'ai-architect' | 'presets'>('ocr');

  // OCR state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [ocrNotes, setOcrNotes] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // AI Architect state
  const [targetClass, setTargetClass] = useState<'Class 11' | 'Class 12' | 'Dropper / Repeater'>('Class 11');
  const [planDays, setPlanDays] = useState(7);
  const [dailyHours, setDailyHours] = useState(8);
  const [weakTopics, setWeakTopics] = useState('Rotational Motion, GOC Mechanisms, Definite Integrals');
  const [backlogs, setBacklogs] = useState('Newton Laws of Motion, Chemical Equilibrium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setOcrError('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    setOcrError(null);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      soundSynth.playBeep(800, 100);
    };
    reader.readAsDataURL(file);
  };

  const handleScanImage = async () => {
    if (!selectedImage) {
      setOcrError('Please select or upload a timetable image first.');
      return;
    }

    setIsScanning(true);
    setOcrError(null);
    soundSynth.playBell();

    try {
      const response = await fetch('/api/scan-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType,
          instructions: ocrNotes,
        }),
      });

      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Failed to analyze schedule image.');
      }

      if (result.data && result.data.schedule) {
        const formattedPlan: JEEPlan = {
          ...result.data,
          schedule: result.data.schedule.map((day: any) => ({
            ...day,
            tasks: day.tasks.map((t: any) => ({
              ...t,
              completed: false,
            })),
          })),
        };

        onPlanLoaded(formattedPlan);
        soundSynth.playVictory();
      } else {
        throw new Error('Could not parse day-wise checklist from image.');
      }
    } catch (err: any) {
      console.error(err);
      setOcrError(err.message || 'Image scan error. Ensure your image is legible or use a preset.');
      soundSynth.playBeep(300, 300);
    } finally {
      setIsScanning(false);
    }
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setGenError(null);
    soundSynth.playBell();

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examTarget: 'JEE 2027',
          studentClass: targetClass,
          days: planDays,
          hoursPerDay: dailyHours,
          weakAreas: weakTopics,
          currentBacklogs: backlogs,
        }),
      });

      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Failed to generate study plan.');
      }

      if (result.data && result.data.schedule) {
        const formattedPlan: JEEPlan = {
          ...result.data,
          schedule: result.data.schedule.map((day: any) => ({
            ...day,
            tasks: day.tasks.map((t: any) => ({
              ...t,
              completed: false,
            })),
          })),
        };

        onPlanLoaded(formattedPlan);
        soundSynth.playVictory();
      } else {
        throw new Error('AI could not format schedule properly.');
      }
    } catch (err: any) {
      console.error(err);
      setGenError(err.message || 'Error generating plan.');
      soundSynth.playBeep(300, 300);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadPreset = (plan: JEEPlan) => {
    onPlanLoaded(plan);
    soundSynth.playVictory();
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="text-xs uppercase tracking-wider font-mono text-zinc-400">
            Intelligent Schedule Ingestion
          </div>
          <h2 className="text-lg font-bold text-white mt-0.5">
            Timetable OCR Scanner & AI Generator
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Scan handwritten coaching routines, or generate high-yield preparation plans.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg text-xs font-mono">
          <button
            onClick={() => setActiveTab('ocr')}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === 'ocr' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Image OCR
          </button>
          <button
            onClick={() => setActiveTab('ai-architect')}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === 'ai-architect' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            AI Generator
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === 'presets' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Presets
          </button>
        </div>
      </div>

      {/* Tab 1: OCR Image Scanner */}
      {activeTab === 'ocr' && (
        <div className="grid md:grid-cols-2 gap-5">
          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[190px] ${
              selectedImage
                ? 'border-zinc-500 bg-zinc-900/40'
                : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedImage ? (
              <div className="relative w-full max-w-xs mx-auto">
                <img
                  src={selectedImage}
                  alt="Schedule Preview"
                  className="max-h-44 rounded-lg object-contain mx-auto border border-zinc-800"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(null);
                  }}
                  className="absolute -top-2 -right-2 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white shadow"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="text-[11px] text-zinc-400 mt-2 font-mono">Image loaded. Click scan below.</div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-6 h-6 text-zinc-400 mx-auto" />
                <div className="text-xs font-semibold text-zinc-200">
                  Upload coaching timetable or routine photo
                </div>
                <p className="text-[11px] text-zinc-500">
                  Handwritten notes, Allen / PW / FIITJEE routines (JPG, PNG, WEBP)
                </p>
              </div>
            )}
          </div>

          {/* Notes and Scan Button */}
          <div className="flex flex-col justify-between space-y-4 bg-zinc-900/30 border border-zinc-800 p-4 rounded-xl">
            <div>
              <label className="text-[11px] uppercase tracking-wider font-mono text-zinc-400 block mb-1">
                Custom Instructions (Optional)
              </label>
              <textarea
                value={ocrNotes}
                onChange={(e) => setOcrNotes(e.target.value)}
                placeholder="e.g. Prioritize physics numericals, exclude 8am-2pm school hours, include NCERT revision..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none h-24 font-mono"
              />
            </div>

            {ocrError && (
              <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg flex items-start gap-2 text-zinc-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-white" />
                <span>{ocrError}</span>
              </div>
            )}

            <button
              onClick={handleScanImage}
              disabled={!selectedImage || isScanning}
              className={`w-full py-2.5 rounded-lg text-xs font-semibold tracking-wide transition flex items-center justify-center gap-2 ${
                !selectedImage || isScanning
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing with Gemini 3.8 Flash...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Extract Day-Wise Checklist</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: AI Plan Generator */}
      {activeTab === 'ai-architect' && (
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-zinc-400 font-mono block mb-1">Student Stage</label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs rounded-lg px-3 py-2 font-mono"
              >
                <option value="Class 11">Class 11 (Foundation Core)</option>
                <option value="Class 12">Class 12 (Board + Advanced Target)</option>
                <option value="Dropper / Repeater">Dropper / Full Time Aspirant</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-mono block mb-1">Duration</label>
              <select
                value={planDays}
                onChange={(e) => setPlanDays(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs rounded-lg px-3 py-2 font-mono"
              >
                <option value={3}>3-Day Sprint</option>
                <option value={5}>5-Day Fast-Track</option>
                <option value={7}>7-Day Standard Weekly Routine</option>
                <option value={14}>14-Day Revision Cycle</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-mono block mb-1">Daily Study Hours</label>
              <select
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs rounded-lg px-3 py-2 font-mono"
              >
                <option value={6}>6 Hours (Self-Study + School)</option>
                <option value={8}>8 Hours (Standard Kota Routine)</option>
                <option value={10}>10 Hours (Intensive Holiday)</option>
                <option value={12}>12 Hours (Rank Booster)</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-zinc-400 font-mono block mb-1">Priority Weak Chapters</label>
              <input
                type="text"
                value={weakTopics}
                onChange={(e) => setWeakTopics(e.target.value)}
                placeholder="e.g. Rotational Motion, GOC, Definite Integrals"
                className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs rounded-lg px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 font-mono block mb-1">Backlog Chapters</label>
              <input
                type="text"
                value={backlogs}
                onChange={(e) => setBacklogs(e.target.value)}
                placeholder="e.g. NLM Friction, Chemical Equilibrium"
                className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs rounded-lg px-3 py-2 font-mono"
              />
            </div>
          </div>

          {genError && (
            <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300 text-xs">
              {genError}
            </div>
          )}

          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className={`w-full py-2.5 rounded-lg text-xs font-semibold tracking-wide transition flex items-center justify-center gap-2 ${
              isGenerating
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating tailored study schedule...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Synthesize {planDays}-Day Schedule</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Tab 3: Presets */}
      {activeTab === 'presets' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {SAMPLE_JEE_PLANS.map((preset) => (
            <div
              key={preset.id}
              className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>{preset.plan.totalDays} Days · {preset.plan.dailyStudyHoursTarget}h / day</span>
                  <span>{preset.plan.schedule.reduce((acc, d) => acc + d.tasks.length, 0)} Tasks</span>
                </div>
                <h3 className="font-bold text-sm text-white">{preset.plan.planTitle}</h3>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {preset.plan.summary}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-zinc-800/80">
                <button
                  onClick={() => handleLoadPreset(preset.plan)}
                  className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-white text-zinc-300 hover:text-black border border-zinc-800 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Load Preset Schedule</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
