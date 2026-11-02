import React, { useState } from 'react';
import { DaySchedule, Task, SubjectType } from '../types/jee';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Download,
  Search,
  ChevronDown,
  ChevronRight,
  Calendar,
  FileText,
  Save,
  Eye,
  Edit3,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundSynth } from '../utils/audio';
import { downloadICS, getGoogleCalendarWebUrl } from '../utils/calendarExport';
import { formatMarkdown } from '../utils/markdown';

interface ChecklistMasterProps {
  schedule: DaySchedule[];
  onToggleTask: (dayNumber: number, taskId: string) => void;
  onAddTask: (dayNumber: number, task: Partial<Task>) => void;
  onDeleteTask: (dayNumber: number, taskId: string) => void;
  onUpdateTaskNotes: (dayNumber: number, taskId: string, notes: string) => void;
  onAskAI: (task: Task) => void;
  planTitle: string;
}

export const ChecklistMaster: React.FC<ChecklistMasterProps> = ({
  schedule,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onUpdateTaskNotes,
  onAskAI,
  planTitle,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({ 1: true });
  const [addingTaskForDay, setAddingTaskForDay] = useState<number | null>(null);

  // Quick Notes editing state
  const [editingNotesTaskId, setEditingNotesTaskId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [notePreviewModes, setNotePreviewModes] = useState<Record<string, boolean>>({});

  // New task form state
  const [newTopic, setNewTopic] = useState('');
  const [newSubject, setNewSubject] = useState<SubjectType>('Physics');
  const [newTargetDetails, setNewTargetDetails] = useState('');
  const [newEstimatedMinutes, setNewEstimatedMinutes] = useState(60);

  const toggleDayExpanded = (dayNum: number) => {
    setExpandedDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  const handleTaskCheckbox = (dayNumber: number, taskId: string, currentlyCompleted: boolean) => {
    onToggleTask(dayNumber, taskId);

    if (!currentlyCompleted) {
      soundSynth.playBeep(659.25, 120);

      const currentDay = schedule.find((d) => d.dayNumber === dayNumber);
      if (currentDay) {
        const remainingInDay = currentDay.tasks.filter((t) => t.taskId !== taskId && !t.completed).length;
        if (remainingInDay === 0) {
          soundSynth.playVictory();
          confetti({
            particleCount: 60,
            spread: 55,
            origin: { y: 0.6 },
            colors: ['#ffffff', '#a1a1aa', '#52525b'],
          });
        }
      }
    }
  };

  const submitNewTask = (dayNumber: number) => {
    if (!newTopic.trim()) return;

    onAddTask(dayNumber, {
      subject: newSubject,
      topic: newTopic,
      targetDetails: newTargetDetails || 'Self-study problem set',
      estimatedMinutes: Number(newEstimatedMinutes) || 60,
      difficulty: 'Moderate',
      isHighYield: false,
    });

    setNewTopic('');
    setNewTargetDetails('');
    setAddingTaskForDay(null);
    soundSynth.playBeep(880, 100);
  };

  const exportScheduleJSON = () => {
    const jsonStr = JSON.stringify({ planTitle, exportedAt: new Date().toISOString(), schedule }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JEE_2027_Plan_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    soundSynth.playVictory();
  };

  const handleSyncToCalendar = () => {
    downloadICS(schedule, planTitle);
    soundSynth.playVictory();
  };

  const handleToggleNoteEdit = (task: Task) => {
    if (editingNotesTaskId === task.taskId) {
      setEditingNotesTaskId(null);
    } else {
      setEditingNotesTaskId(task.taskId);
      if (noteDrafts[task.taskId] === undefined) {
        setNoteDrafts((prev) => ({ ...prev, [task.taskId]: task.notes || '' }));
      }
    }
  };

  const handleSaveNote = (dayNumber: number, taskId: string) => {
    const noteText = noteDrafts[taskId] || '';
    onUpdateTaskNotes(dayNumber, taskId, noteText);
    setEditingNotesTaskId(null);
    soundSynth.playBeep(800, 80);
  };

  const toggleNotePreview = (taskId: string) => {
    setNotePreviewModes((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const filterTask = (task: Task) => {
    if (selectedSubject !== 'All' && task.subject !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        task.topic.toLowerCase().includes(q) ||
        task.targetDetails.toLowerCase().includes(q) ||
        (task.notes && task.notes.toLowerCase().includes(q)) ||
        (task.resource && task.resource.toLowerCase().includes(q))
      );
    }
    return true;
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
      {/* Header & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="text-xs uppercase tracking-wider font-mono text-zinc-400">
            Preparation Matrix
          </div>
          <h2 className="text-lg font-bold text-white mt-0.5">{planTitle || 'Day-Wise Checklist'}</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Complete daily modules, write markdown scratchpad notes, and sync schedule to your calendar.
          </p>
        </div>

        {/* Toolbar: Search, Filters, Export & Calendar Sync */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Search box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topic, note, or book..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
            />
          </div>

          {/* Subject Filter Tabs */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg text-xs font-mono">
            {['All', 'Physics', 'Chemistry', 'Mathematics'].map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-2.5 py-1 rounded transition ${
                  selectedSubject === subj
                    ? 'bg-white text-black font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          {/* Sync to Calendar Button */}
          <button
            onClick={handleSyncToCalendar}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-white text-zinc-300 hover:text-black border border-zinc-800 text-xs font-mono transition flex items-center gap-1.5"
            title="Download RFC 5545 .ics calendar file for Google Calendar & Apple Calendar"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Sync Calendar</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={exportScheduleJSON}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
            title="Download Plan as JSON"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days list */}
      {schedule.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 text-xs font-mono">
          No active timetable. Use the scanner or load a preset above to begin.
        </div>
      ) : (
        <div className="space-y-4">
          {schedule.map((day) => {
            const filteredTasks = day.tasks.filter(filterTask);
            const totalDayTasks = day.tasks.length;
            const completedCount = day.tasks.filter((t) => t.completed).length;
            const isDayFinished = totalDayTasks > 0 && completedCount === totalDayTasks;
            const dayMinutes = day.tasks.reduce((acc, t) => acc + (t.completed ? t.estimatedMinutes : 0), 0);
            const totalEstimatedDayMins = day.tasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);
            const isExpanded = expandedDays[day.dayNumber] !== false;

            return (
              <div
                key={day.dayNumber}
                className={`border rounded-xl overflow-hidden transition-all ${
                  isDayFinished
                    ? 'bg-zinc-900/20 border-zinc-900'
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {/* Day Header Accordion */}
                <div
                  onClick={() => toggleDayExpanded(day.dayNumber)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-zinc-900/60 transition"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-zinc-500 hover:text-white transition">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          Day {day.dayNumber}: {day.dateLabel || `Day ${day.dayNumber}`}
                        </span>
                        {isDayFinished && (
                          <span className="text-[10px] font-mono text-zinc-400 uppercase">
                            · Completed
                          </span>
                        )}
                      </div>
                      {day.dayFocus && (
                        <p className="text-xs text-zinc-400 mt-0.5">{day.dayFocus}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right">
                      <div className="text-zinc-300">
                        {completedCount}/{totalDayTasks} Tasks
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {Math.round(dayMinutes / 60 * 10) / 10}h / {Math.round(totalEstimatedDayMins / 60 * 10) / 10}h
                      </div>
                    </div>

                    <div className="w-20 sm:w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-300"
                        style={{ width: `${totalDayTasks ? (completedCount / totalDayTasks) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Day Tasks */}
                {isExpanded && (
                  <div className="p-4 pt-0 space-y-3 border-t border-zinc-800/60">
                    {filteredTasks.length === 0 ? (
                      <div className="py-4 text-center text-xs text-zinc-500 font-mono">
                        No tasks match active filters for this day.
                      </div>
                    ) : (
                      filteredTasks.map((t) => {
                        const isNoteOpen = editingNotesTaskId === t.taskId;
                        const noteContent =
                          noteDrafts[t.taskId] !== undefined ? noteDrafts[t.taskId] : t.notes || '';
                        const isPreview = notePreviewModes[t.taskId] || false;

                        return (
                          <div
                            key={t.taskId}
                            className={`p-3.5 rounded-lg border transition-all space-y-2.5 ${
                              t.completed
                                ? 'bg-zinc-950/40 border-zinc-900 opacity-70'
                                : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                <button
                                  onClick={() => handleTaskCheckbox(day.dayNumber, t.taskId, t.completed)}
                                  className="mt-0.5 shrink-0 text-white hover:text-zinc-300 transition"
                                >
                                  {t.completed ? (
                                    <CheckCircle2 className="w-4 h-4 fill-white text-black" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-zinc-600 hover:text-zinc-400" />
                                  )}
                                </button>

                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                                    <span className="font-semibold text-white">{t.subject}</span>
                                    <span>·</span>
                                    <span>{t.estimatedMinutes}m</span>
                                    {t.isHighYield && (
                                      <>
                                        <span>·</span>
                                        <span className="text-zinc-300 uppercase font-semibold">High-Yield</span>
                                      </>
                                    )}
                                    {t.difficulty && (
                                      <>
                                        <span>·</span>
                                        <span>{t.difficulty}</span>
                                      </>
                                    )}
                                  </div>

                                  <div
                                    className={`text-xs font-semibold ${
                                      t.completed ? 'line-through text-zinc-500' : 'text-zinc-100'
                                    }`}
                                  >
                                    {t.topic}
                                  </div>

                                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                                    {t.targetDetails}
                                  </p>

                                  {t.resource && (
                                    <span className="inline-block text-[10px] text-zinc-500 font-mono">
                                      Resource: {t.resource}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Controls */}
                              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                {/* Quick Notes button */}
                                <button
                                  onClick={() => handleToggleNoteEdit(t)}
                                  className={`px-2.5 py-1 rounded-md border text-[11px] font-mono transition flex items-center gap-1 ${
                                    t.notes || isNoteOpen
                                      ? 'bg-zinc-800 border-zinc-600 text-white'
                                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                                  }`}
                                  title="Add Markdown scratchpad note for this task"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>{t.notes ? 'Notes ✓' : 'Note'}</span>
                                </button>

                                {/* AI Trick button */}
                                <button
                                  onClick={() => onAskAI(t)}
                                  className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-white text-[11px] font-mono transition flex items-center gap-1"
                                  title="Ask AI for 2-minute formula trap/trick"
                                >
                                  <Sparkles className="w-3 h-3 text-zinc-400" />
                                  <span>AI Trick</span>
                                </button>

                                <button
                                  onClick={() => onDeleteTask(day.dayNumber, t.taskId)}
                                  className="p-1 rounded text-zinc-600 hover:text-zinc-300 transition"
                                  title="Delete Task"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Collapsible Markdown Quick Notes Scratchpad */}
                            {isNoteOpen && (
                              <div className="pt-2 border-t border-zinc-800/80 space-y-2 bg-zinc-900/60 p-3 rounded-lg">
                                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                                  <span className="font-semibold text-white flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-zinc-300" />
                                    <span>Quick Notes & Scratchpad (Markdown Supported)</span>
                                  </span>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => toggleNotePreview(t.taskId)}
                                      className="text-zinc-400 hover:text-white flex items-center gap-1 transition"
                                    >
                                      {isPreview ? (
                                        <>
                                          <Edit3 className="w-3 h-3" /> Edit
                                        </>
                                      ) : (
                                        <>
                                          <Eye className="w-3 h-3" /> Preview
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {isPreview ? (
                                  <div
                                    className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 min-h-[60px] font-sans leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                      __html: formatMarkdown(noteContent) || '<span class="text-zinc-600 italic">No notes written yet. Type your key formulas or DPP questions above.</span>',
                                    }}
                                  />
                                ) : (
                                  <textarea
                                    value={noteContent}
                                    onChange={(e) =>
                                      setNoteDrafts((prev) => ({ ...prev, [t.taskId]: e.target.value }))
                                    }
                                    placeholder="Write quick formulas, questions solved, or textbook page numbers... (supports **bold**, `code/formulas`, - lists)"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono resize-none h-20"
                                  />
                                )}

                                <div className="flex items-center justify-between pt-1">
                                  <span className="text-[10px] text-zinc-500 font-mono">
                                    Saved in LocalStorage
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setEditingNotesTaskId(null)}
                                      className="px-3 py-1 rounded text-xs text-zinc-400 hover:text-white transition"
                                    >
                                      Close
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveNote(day.dayNumber, t.taskId)}
                                      className="px-3.5 py-1 rounded bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition flex items-center gap-1"
                                    >
                                      <Save className="w-3 h-3" />
                                      <span>Save Note</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Passive note preview if note exists and drawer is collapsed */}
                            {!isNoteOpen && t.notes && (
                              <div
                                onClick={() => handleToggleNoteEdit(t)}
                                className="text-[11px] text-zinc-400 bg-zinc-900/40 border border-zinc-800/60 p-2 rounded cursor-pointer hover:border-zinc-700 transition font-mono truncate"
                                title="Click to view or edit full note"
                              >
                                <span className="text-zinc-300 font-semibold mr-1.5">Note:</span>
                                {t.notes}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}

                    {/* Add Custom Target */}
                    {addingTaskForDay === day.dayNumber ? (
                      <div className="p-4 bg-zinc-950 border border-zinc-700 rounded-lg space-y-3 mt-2">
                        <div className="text-xs font-bold text-white uppercase font-mono">
                          Add Custom JEE Task
                        </div>
                        <div className="grid sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Topic (e.g. Center of Mass cavity problems)"
                            value={newTopic}
                            onChange={(e) => setNewTopic(e.target.value)}
                            className="sm:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
                          />
                          <select
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value as any)}
                            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none font-mono"
                          >
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Mock Test">Mock Test</option>
                            <option value="Revision">Revision</option>
                          </select>
                        </div>
                        <div className="grid sm:grid-cols-4 gap-2">
                          <input
                            type="text"
                            placeholder="Target Details (e.g. 20 PYQs + HC Verma)"
                            value={newTargetDetails}
                            onChange={(e) => setNewTargetDetails(e.target.value)}
                            className="sm:col-span-3 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
                          />
                          <input
                            type="number"
                            placeholder="Mins (60)"
                            value={newEstimatedMinutes}
                            onChange={(e) => setNewEstimatedMinutes(Number(e.target.value))}
                            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none font-mono"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => setAddingTaskForDay(null)}
                            className="px-3 py-1 rounded-lg text-xs text-zinc-400 hover:text-white transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => submitNewTask(day.dayNumber)}
                            className="px-4 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition"
                          >
                            Add Target
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingTaskForDay(day.dayNumber)}
                        className="w-full py-2 border border-dashed border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition mt-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Topic to Day {day.dayNumber}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
