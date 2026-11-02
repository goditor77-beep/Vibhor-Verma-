export type SubjectType = 'Physics' | 'Chemistry' | 'Mathematics' | 'Mock Test' | 'Revision' | 'General';

export interface Task {
  taskId: string;
  subject: SubjectType;
  topic: string;
  targetDetails: string;
  resource?: string;
  estimatedMinutes: number;
  difficulty?: 'Easy' | 'Moderate' | 'Challenging' | 'Revision' | string;
  isHighYield?: boolean;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface DaySchedule {
  dayNumber: number;
  dateLabel: string;
  dayFocus?: string;
  tasks: Task[];
}

export interface JEEPlan {
  planTitle: string;
  targetExam: string;
  summary: string;
  totalDays: number;
  dailyStudyHoursTarget: number;
  schedule: DaySchedule[];
}

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

export interface ErrorLogItem {
  id: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
  chapter: string;
  mistakeType: 'Calculation Error' | 'Formula Forgotten' | 'Misread Question' | 'Conceptual Trap' | 'Time Pressure' | 'Negative Marking Trap';
  questionSummary: string;
  correctApproach: string;
  resolved: boolean;
  date: string;
}

export interface MockTestAttempt {
  id: string;
  testName: string;
  date: string;
  physicsScore: number;
  chemScore: number;
  mathsScore: number;
  totalScore: number;
  negativeMarksLost: number;
  projectedPercentile: number;
}

export interface FormulaCard {
  id: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
  chapter: string;
  title: string;
  formula: string;
  trapWarning: string;
  shortcut: string;
}
