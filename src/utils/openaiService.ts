
import OpenAI from 'openai';
import { ParsedTask } from '../types/Task';

export class OpenAIService {
  private openai: OpenAI | null = null;

  constructor(apiKey?: string) {
    // Get API key from environment or passed parameter
    const key = apiKey || getApiKey();
    
    if (key) {
      this.openai = new OpenAI({
        apiKey: key,
        dangerouslyAllowBrowser: true
      });
    }
  }

  async parseTaskWithAI(input: string): Promise<ParsedTask | null> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      // Get current date for context
      const now = new Date();
      const currentDateString = now.toISOString();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // 0-indexed to 1-indexed
      const currentDay = now.getDate();

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a task management assistant. Parse the user's task description and extract structured information. Analyze the input text carefully and extract the following information: Task title, Assignee, Due date, Due time, and Priority. Always respond with a valid JSON object containing these fields:
            - title: A clear, concise task title (string)
            - assignee: The person assigned (string, can be empty if not specified)
            - dueDate: ISO date string in UTC format (default to tomorrow 5PM if not specified)
            - dueDateFormatted: Human-readable date (e.g., "20th June 2025")
            - dueTimeFormatted: Human-readable time (e.g., "11:00 PM")
            - priority: One of "P1", "P2", "P3", "P4" (P3 is default, P1 is highest priority)
            - priorityText: Human-readable priority (e.g., "High", "Medium", "Low")
            - priorityReason: Brief explanation of why this priority was assigned

            IMPORTANT DATE HANDLING RULES:
            1. Today's date is ${currentMonth}/${currentDay}/${currentYear} (${currentDateString}).
            2. When a date is mentioned without a year (e.g., "May 15", "June 2"), ALWAYS set it to a FUTURE date.
            3. If the date would occur in the past for the current year, use NEXT year instead.
            4. For example, if today is May 29, 2025, and the user says "May 15", use May 15, 2026.
            5. If the user says "June 2", use June 2, 2025 (since that's still in the future).
            6. ALWAYS include the year in dueDateFormatted (e.g., "20th June 2025").
            7. ALWAYS set the dueDate ISO string to include the correct year, month, day, hour, and minute.

            Consider these priority guidelines:
            - P1 (High): Urgent/emergency tasks, ASAP, critical deadlines
            - P2 (Medium-High): Important tasks, high priority
            - P3 (Medium): Normal priority (default)
            - P4 (Low): Low priority, nice to have

            Example response:
            {
              "title": "Finish landing page",
              "assignee": "Aman",
              "dueDate": "2025-06-20T23:00:00.000Z",
              "dueDateFormatted": "20th June 2025",
              "dueTimeFormatted": "11:00 PM",
              "priority": "P2",
              "priorityText": "High",
              "priorityReason": "Inferred due to specific deadline and time"
            }`
          },
          {
            role: "user",
            content: input
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const parsed = JSON.parse(content);
      
      // Validate the response structure
      if (!parsed.title || !parsed.dueDate || !parsed.priority) {
        throw new Error('Invalid response structure from OpenAI');
      }

      // Ensure the date is in the future if it's not already
      const dueDate = new Date(parsed.dueDate);
      const currentTime = new Date();
      
      // If the date is in the past, add years until it's in the future
      if (dueDate < currentTime) {
        dueDate.setFullYear(dueDate.getFullYear() + 1);
      }
      
      // Determine if time was specified based on the presence of dueTimeFormatted
      const timeSpecified = !!parsed.dueTimeFormatted;
      
      return {
        title: parsed.title,
        assignee: parsed.assignee || '',
        dueDate: dueDate.toISOString(),
        priority: parsed.priority,
        dueDateFormatted: parsed.dueDateFormatted,
        dueTimeFormatted: parsed.dueTimeFormatted,
        timeSpecified,
        priorityText: parsed.priorityText,
        priorityReason: parsed.priorityReason
      };
    } catch (error) {
      console.error('OpenAI parsing error:', error);
      throw error;
    }
  }
}

// API key handling functions
export const getApiKey = (): string | null => {
  // Prioritize environment variable, fall back to localStorage only if needed
  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
  return envKey || null;
};

// These functions are kept for backward compatibility but won't be used in the main flow
export const saveApiKey = (key: string): void => {
  console.warn('API key is now managed through environment variables');
};

export const clearApiKey = (): void => {
  console.warn('API key is now managed through environment variables');
};
