import { DaySchedule, Task } from '../types/jee';

/**
 * Generates an RFC 5545 compliant .ics iCalendar file for JEE study sessions.
 * Compatible with Google Calendar, Apple Calendar, Outlook, and Android.
 */
export function generateICSContent(schedule: DaySchedule[], planTitle: string = 'JEE 2027 Schedule'): string {
  const now = new Date();
  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const dtstamp = formatICSDate(now);

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JEE 2027 Command AI//Study Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${cleanText(planTitle)}`,
    'X-WR-TIMEZONE:Asia/Kolkata',
  ];

  // Base starting date: tomorrow 9:00 AM if not specified
  schedule.forEach((day, dayIndex) => {
    const dayDate = new Date();
    dayDate.setDate(now.getDate() + dayIndex);

    let startHour = 9; // 9:00 AM IST
    let startMin = 0;

    day.tasks.forEach((task, taskIndex) => {
      const taskStart = new Date(dayDate);
      taskStart.setHours(startHour, startMin, 0, 0);

      const durationMin = task.estimatedMinutes || 60;
      const taskEnd = new Date(taskStart.getTime() + durationMin * 60 * 1000);

      // Advance next task start by duration + 15 min buffer
      startMin += durationMin + 15;
      while (startMin >= 60) {
        startHour += 1;
        startMin -= 60;
      }

      const uid = `jee-2027-${day.dayNumber}-${task.taskId}-${Date.now()}@jeecommand.app`;
      const summary = `[${task.subject}] ${task.topic}`;
      const description = [
        `Target: ${task.targetDetails}`,
        task.resource ? `Resource: ${task.resource}` : '',
        task.notes ? `Quick Notes: ${task.notes}` : '',
        `Duration: ${durationMin} mins`,
        'Plan: JEE 2027 Master Command AI',
      ]
        .filter(Boolean)
        .join('\\n');

      lines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${formatICSDate(taskStart)}`,
        `DTEND:${formatICSDate(taskEnd)}`,
        `SUMMARY:${cleanText(summary)}`,
        `DESCRIPTION:${cleanText(description)}`,
        'LOCATION:JEE Study Desk',
        'STATUS:CONFIRMED',
        // 15-minute reminder notification
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:Reminder: ${cleanText(summary)} begins in 15 mins`,
        'TRIGGER:-PT15M',
        'END:VALARM',
        'END:VEVENT'
      );
    });
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function cleanText(text: string): string {
  return text.replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

export function downloadICS(schedule: DaySchedule[], planTitle: string = 'JEE 2027 Schedule') {
  const icsData = generateICSContent(schedule, planTitle);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `JEE_2027_Study_Schedule_${new Date().toISOString().split('T')[0]}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getGoogleCalendarWebUrl(task: Task, dateOffsetDays: number = 0): string {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + dateOffsetDays);
  targetDate.setHours(9, 0, 0, 0);

  const durationMin = task.estimatedMinutes || 60;
  const endDate = new Date(targetDate.getTime() + durationMin * 60 * 1000);

  const formatGCal = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const text = encodeURIComponent(`[${task.subject}] ${task.topic}`);
  const details = encodeURIComponent(
    `Target: ${task.targetDetails}\nResource: ${task.resource || 'Self study'}\n${task.notes ? `Notes: ${task.notes}` : ''}`
  );
  const dates = `${formatGCal(targetDate)}/${formatGCal(endDate)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&dates=${dates}&location=Study%20Desk`;
}
