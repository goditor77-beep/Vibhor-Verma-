import React, { useState, useEffect } from 'react';
import { Header, NavTab } from './components/Header';
import { CountdownClock } from './components/CountdownClock';
import { ConsistencyStreak } from './components/ConsistencyStreak';
import { TimerAndAlarm } from './components/TimerAndAlarm';
import { ScheduleScanner } from './components/ScheduleScanner';
import { ChecklistMaster } from './components/ChecklistMaster';
import { ProgressDashboard } from './components/ProgressDashboard';
import { MockExamStudio } from './components/MockExamStudio';
import { OfflineInstallBanner } from './components/OfflineInstallBanner';
import { DoubtModal } from './components/DoubtModal';
import { ContactSupportModal } from './components/ContactSupportModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { Footer } from './components/Footer';
import { JEEPlan, Task } from './types/jee';
import { SAMPLE_JEE_PLANS } from './data/sampleSchedules';
import { soundSynth } from './utils/audio';

export default function App() {
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<NavTab>('overview');

  // Target Exam Date state
  const [targetDate, setTargetDate] = useState<string>(() => {
    return localStorage.getItem('jee_target_date') || '2027-01-24';
  });

  const [examName, setExamName] = useState<string>(() => {
    return localStorage.getItem('jee_exam_name') || 'JEE Main 2027 (Jan)';
  });

  // Active Plan State
  const [plan, setPlan] = useState<JEEPlan>(() => {
    try {
      const stored = localStorage.getItem('jee_plan');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return SAMPLE_JEE_PLANS[0].plan;
  });

  // Modal States
  const [selectedTaskForAI, setSelectedTaskForAI] = useState<Task | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAndroidModal, setShowAndroidModal] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('jee_target_date', targetDate);
    localStorage.setItem('jee_exam_name', examName);
    localStorage.setItem('jee_plan', JSON.stringify(plan));
  }, [targetDate, examName, plan]);

  // Request Notification permission on startup
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handlePlanLoaded = (newPlan: JEEPlan) => {
    setPlan(newPlan);
  };

  const handleToggleTask = (dayNumber: number, taskId: string) => {
    setPlan((prevPlan) => {
      const updatedSchedule = prevPlan.schedule.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        return {
          ...day,
          tasks: day.tasks.map((task) => {
            if (task.taskId !== taskId) return task;
            const nextCompleted = !task.completed;
            return {
              ...task,
              completed: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString() : undefined,
            };
          }),
        };
      });

      return {
        ...prevPlan,
        schedule: updatedSchedule,
      };
    });
  };

  const handleUpdateTaskNotes = (dayNumber: number, taskId: string, notes: string) => {
    setPlan((prevPlan) => {
      const updatedSchedule = prevPlan.schedule.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        return {
          ...day,
          tasks: day.tasks.map((task) => {
            if (task.taskId !== taskId) return task;
            return {
              ...task,
              notes,
            };
          }),
        };
      });

      return {
        ...prevPlan,
        schedule: updatedSchedule,
      };
    });
  };

  const handleAddTask = (dayNumber: number, partialTask: Partial<Task>) => {
    const newTask: Task = {
      taskId: `custom-${Date.now()}`,
      subject: partialTask.subject || 'Physics',
      topic: partialTask.topic || 'Custom Target',
      targetDetails: partialTask.targetDetails || 'Self study topic',
      resource: partialTask.resource || 'Self Notes',
      estimatedMinutes: partialTask.estimatedMinutes || 60,
      difficulty: partialTask.difficulty || 'Moderate',
      isHighYield: partialTask.isHighYield || false,
      completed: false,
      notes: '',
    };

    setPlan((prevPlan) => {
      const updatedSchedule = prevPlan.schedule.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        return {
          ...day,
          tasks: [...day.tasks, newTask],
        };
      });

      return {
        ...prevPlan,
        schedule: updatedSchedule,
      };
    });
  };

  const handleDeleteTask = (dayNumber: number, taskId: string) => {
    setPlan((prevPlan) => {
      const updatedSchedule = prevPlan.schedule.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        return {
          ...day,
          tasks: day.tasks.filter((t) => t.taskId !== taskId),
        };
      });

      return {
        ...prevPlan,
        schedule: updatedSchedule,
      };
    });
    soundSynth.playBeep(450, 100);
  };

  // Stats
  const allTasks = plan.schedule.flatMap((d) => d.tasks);
  const totalTasksCount = allTasks.length;
  const completedTasksCount = allTasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased selection:bg-white selection:text-black flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <Header
          targetDate={targetDate}
          onTargetDateChange={setTargetDate}
          examName={examName}
          onExamNameChange={setExamName}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenContact={() => setShowContactModal(true)}
          completedTasksCount={completedTasksCount}
          totalTasksCount={totalTasksCount}
        />

        {/* Main Workspace */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <CountdownClock targetDate={targetDate} examName={examName} />
              
              {/* Consistency Streak Motivation Engine */}
              <ConsistencyStreak completedTasksCount={completedTasksCount} />

              <TimerAndAlarm />
              
              <OfflineInstallBanner />

              {/* Quick Glimpse of current active day's targets */}
              <ChecklistMaster
                schedule={plan.schedule.slice(0, 2)}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                onUpdateTaskNotes={handleUpdateTaskNotes}
                onAskAI={(task) => setSelectedTaskForAI(task)}
                planTitle="Active Priority Modules"
              />
            </div>
          )}

          {/* TAB 2: PLANNER & OCR */}
          {activeTab === 'planner' && (
            <div className="space-y-6">
              <ScheduleScanner onPlanLoaded={handlePlanLoaded} activePlanTitle={plan.planTitle} />
              <ChecklistMaster
                schedule={plan.schedule}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                onUpdateTaskNotes={handleUpdateTaskNotes}
                onAskAI={(task) => setSelectedTaskForAI(task)}
                planTitle={plan.planTitle}
              />
            </div>
          )}

          {/* TAB 3: TRAJECTORY & ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <ProgressDashboard schedule={plan.schedule} />
            </div>
          )}

          {/* TAB 4: MOCK EXAM STUDIO */}
          {activeTab === 'mock-exam' && (
            <MockExamStudio />
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer
        onTabChange={setActiveTab}
        onOpenContact={() => setShowContactModal(true)}
        onOpenAndroid={() => setShowAndroidModal(true)}
      />

      {/* Concept & Trick Modal */}
      {selectedTaskForAI && (
        <DoubtModal task={selectedTaskForAI} onClose={() => setSelectedTaskForAI(null)} />
      )}

      {/* Contact & Support Modal */}
      <ContactSupportModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />

      {/* Android Install Modal */}
      <AndroidInstallModal
        isOpen={showAndroidModal}
        onClose={() => setShowAndroidModal(false)}
      />
    </div>
  );
}
