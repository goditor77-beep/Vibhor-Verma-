import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Allow larger payload for high-res camera photos of timetables
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));

  // Helper to initialize Gemini SDK
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Response schema for structured JEE schedule
  const scheduleResponseSchema = {
    type: Type.OBJECT,
    properties: {
      planTitle: { type: Type.STRING, description: 'Title of the study schedule' },
      targetExam: { type: Type.STRING, description: 'Target exam e.g. JEE Main & Advanced 2027' },
      summary: { type: Type.STRING, description: 'Strategic analysis and advice for this timetable' },
      totalDays: { type: Type.INTEGER, description: 'Total number of days covered' },
      dailyStudyHoursTarget: { type: Type.NUMBER, description: 'Target daily study hours' },
      schedule: {
        type: Type.ARRAY,
        description: 'Day-by-day checklist',
        items: {
          type: Type.OBJECT,
          properties: {
            dayNumber: { type: Type.INTEGER },
            dateLabel: { type: Type.STRING },
            dayFocus: { type: Type.STRING },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  taskId: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  targetDetails: { type: Type.STRING },
                  resource: { type: Type.STRING },
                  estimatedMinutes: { type: Type.INTEGER },
                  difficulty: { type: Type.STRING },
                  isHighYield: { type: Type.BOOLEAN },
                },
                required: ['taskId', 'subject', 'topic', 'targetDetails', 'estimatedMinutes'],
              },
            },
          },
          required: ['dayNumber', 'dateLabel', 'tasks'],
        },
      },
    },
    required: ['planTitle', 'schedule'],
  };

  // POST /api/scan-schedule: Multimodal OCR timetable parsing
  app.post('/api/scan-schedule', async (req: Request, res: Response) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', instructions = '' } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: 'Missing imageBase64 data in request body.' });
      }

      const ai = getGeminiClient();

      // Clean base64 if it has data URL prefix
      const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');

      const prompt = `You are a premier IIT-JEE Academic Strategist & Coaching Master. 
Carefully analyze this study timetable, handwritten routine, coaching schedule, or test syllabus photo.
Extract every single study block, subject slot, DPP/question practice goal, revision topic, and break routine into a clean, day-by-day structured JEE preparation schedule.
Categorize subjects as "Physics", "Chemistry", or "Mathematics" (or "Mock Test" / "Revision" where appropriate).
For targetDetails, include specific actionable goals (e.g., "Solve 25 PYQs from 2021-2024", "Read NCERT Ch 4", "DPP No. 12 problem set").
If difficulty or high yield status is discernible from JEE trends, label it accurately.
${instructions ? `User Special Instructions: "${instructions}"` : ''}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        config: {
          systemInstruction:
            'You are an expert IIT-JEE mentor. Convert timetable images accurately into actionable day-wise JEE checklists with precise topic, subject, and time estimates.',
          responseMimeType: 'application/json',
          responseSchema: scheduleResponseSchema,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Gemini model returned empty response.');
      }

      const parsedData = JSON.parse(text);
      return res.json({ success: true, data: parsedData });
    } catch (err: any) {
      console.error('Error in /api/scan-schedule:', err);
      return res.status(500).json({
        error: err.message || 'Failed to scan schedule image. Please ensure your image is clear and try again.',
      });
    }
  });

  // POST /api/generate-plan: AI Plan Generator for custom target days & syllabus
  app.post('/api/generate-plan', async (req: Request, res: Response) => {
    try {
      const {
        examTarget = 'JEE 2027',
        studentClass = 'Class 11 / Class 12',
        days = 7,
        hoursPerDay = 8,
        focusSubjects = ['Physics', 'Chemistry', 'Mathematics'],
        weakAreas = '',
        currentBacklogs = '',
      } = req.body;

      const ai = getGeminiClient();

      const prompt = `Create an intensive, highly realistic, day-wise study schedule for an IIT-JEE 2027 aspirant.
Target Exam: ${examTarget}
Student Stage: ${studentClass}
Schedule Duration: ${days} days
Daily Study Target: ${hoursPerDay} hours per day
Subjects to cover: ${focusSubjects.join(', ')}
${weakAreas ? `Priority Weak Areas to fix: ${weakAreas}` : ''}
${currentBacklogs ? `Backlog Topics to clear: ${currentBacklogs}` : ''}

Create a balanced routine that includes:
1. Concept revision / theory consolidation
2. Timed numerical problem solving (DPP / HC Verma / MS Chouhan / Cengage / Pyqs)
3. Active recall and error-log review
4. 1 short mock / sectional test block where appropriate
Ensure tasks have reasonable estimatedMinutes (30-120 mins each) that sum up to roughly ${hoursPerDay} hours per day.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a senior Kota IIT-JEE coaching faculty. Generate ultra-structured, practical, top-ranker standard study schedules in JSON.',
          responseMimeType: 'application/json',
          responseSchema: scheduleResponseSchema,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Gemini model returned empty response.');
      }

      const parsedData = JSON.parse(text);
      return res.json({ success: true, data: parsedData });
    } catch (err: any) {
      console.error('Error in /api/generate-plan:', err);
      return res.status(500).json({
        error: err.message || 'Failed to generate study plan.',
      });
    }
  });

  // POST /api/quick-doubt: Quick AI doubt solver or concept explainer for current task
  app.post('/api/quick-doubt', async (req: Request, res: Response) => {
    try {
      const { topic, subject, query } = req.body;
      const ai = getGeminiClient();

      const prompt = `You are a top IIT Bombay / IIT Delhi alumnus and JEE mentor.
A JEE 2027 student is stuck while studying the following task:
Subject: ${subject}
Topic: ${topic}
Student Question: ${query}

Provide a concise, crystal-clear conceptual explanation with:
1. Core Formula & Fundamental Principle
2. Common Pitfalls / Traps in JEE questions for this topic
3. Fast Trick / Method to solve this in under 2 minutes
Keep it motivating, mathematically precise, and formatted in clean markdown.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an elite IIT-JEE mentor providing high-impact, bite-sized conceptual clarity.',
        },
      });

      return res.json({ success: true, answer: response.text });
    } catch (err: any) {
      console.error('Error in /api/quick-doubt:', err);
      return res.status(500).json({ error: err.message || 'Failed to solve doubt.' });
    }
  });

  // Mount Vite or static server
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 JEE 2027 Command Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
