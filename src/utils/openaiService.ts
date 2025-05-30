import OpenAI from 'openai';
import { ParsedTask } from '../types/Task';

// API key handling functions
export function getApiKey(): string | null {
  // Get the API key directly from the environment variable
  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  // Log the environment variable for debugging
  console.log('Environment API key available:', !!envKey);
  
  // Return only the environment variable
  return envKey || null;
}

// Helper function to save API key to localStorage - now deprecated
function saveApiKeyToLocalStorage(key: string): void {
  console.warn('Saving API key to localStorage is deprecated. Please use environment variable VITE_OPENAI_API_KEY instead.');
  // No longer saving to localStorage
}

// Verify if the API key is valid
export async function verifyApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey || apiKey.trim() === '') {
    console.error('Empty API key provided');
    return false;
  }

  try {
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
    
    // Make a minimal API call to verify the key
    await openai.models.list({ limit: 1 });
    return true;
  } catch (error) {
    console.error('API key verification failed:', error);
    return false;
  }
}

interface MultipleTasksResponse {
  tasks: ParsedTask[];
}

export class OpenAIService {
  private openai: OpenAI | null = null;

  constructor(apiKey?: string) {
    // Get API key from environment, passed parameter, or localStorage
    const key = apiKey || getApiKey();
    
    if (key) {
      try {
        this.openai = new OpenAI({
          apiKey: key,
          dangerouslyAllowBrowser: true
        });
        console.log('OpenAI client initialized successfully');
      } catch (error) {
        console.error('Failed to initialize OpenAI client:', error);
        this.openai = null;
      }
    } else {
      console.warn('No OpenAI API key found. Meeting Minutes parsing with AI will not work.');
      this.openai = null;
    }
  }

  /**
   * Extracts tasks from meeting minutes text
   * @param text Meeting minutes text
   * @returns Array of parsed tasks with context
   */
  async extractTasksFromText(text: string): Promise<ParsedTask[]> {
    try {
      console.log('Extracting tasks from text using OpenAI...');
      return await this.parseMultipleTasksWithAI(text);
    } catch (error) {
      console.error('Error extracting tasks with AI:', error);
      // Fall back to local parsing
      return this.fallbackParseMultipleTasks(text);
    }
  }

  /**
   * Parses multiple tasks from meeting minutes using OpenAI GPT-4
   * @param text Meeting minutes text
   * @returns Array of parsed tasks
   */
  async parseMultipleTasksWithAI(text: string): Promise<ParsedTask[]> {
    if (!this.openai) {
      console.error('OpenAI client not initialized. Checking API key...');
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }
      
      // Try to initialize with the API key again
      try {
        this.openai = new OpenAI({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true
        });
        console.log('OpenAI client initialized successfully on demand');
      } catch (initError) {
        console.error('Failed to initialize OpenAI client on demand:', initError);
        throw new Error('Failed to initialize OpenAI client: ' + (initError instanceof Error ? initError.message : String(initError)));
      }
    }
    
    try {
      // Get current date for context
      const now = new Date();
      const currentDateString = now.toISOString();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // 0-indexed to 1-indexed
      const currentDay = now.getDate();
      
      console.log('Making API request to OpenAI...');
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview", // Using latest GPT-4 model for better task parsing
        messages: [
          {
            role: "system",
            content: `You are an advanced task extraction assistant specialized in parsing meeting minutes and conversation text. Your job is to identify and extract tasks with high accuracy, even from ambiguous or complex text.

For each task, identify:
1. Task title/description (be concise but complete)
2. Assignee (the person responsible)
3. Due date/time (with as much precision as specified)
4. Priority level (P1=Urgent, P2=High, P3=Medium, P4=Low)

Today's date is ${currentMonth}/${currentDay}/${currentYear} (${currentDateString}).

You MUST format your response as a valid JSON object with a 'tasks' array containing task objects with these properties:
- title: The task description (string)
- assignee: The person assigned to the task (string)
- dueDate: ISO date string (string)
- dueDateFormatted: Human-readable date (string)
- dueTimeFormatted: Human-readable time or null if not specified (string or null)
- priority: One of P1, P2, P3, or P4 (string)
- priorityText: Text description of priority (Urgent, High, Medium, Low) (string)
- timeSpecified: Boolean indicating if a specific time was mentioned (boolean)
- context: Any additional context about the task that might be helpful (string)

Guidelines:
- Use P3 (Medium) as the default priority unless otherwise specified
- If no specific date is mentioned, set the due date to tomorrow
- If no assignee is mentioned, leave it as an empty string
- Only extract actual tasks that have a clear action
- Be attentive to implicit assignments and deadlines
- Infer priorities based on language urgency when not explicitly stated
- Capture context that might be important for task completion

Example response:
{
  "tasks": [
    {
      "title": "Finish landing page design",
      "assignee": "Aman",
      "dueDate": "2025-06-20T22:00:00.000Z",
      "dueDateFormatted": "June 20, 2025",
      "dueTimeFormatted": "10:00 PM",
      "priority": "P3",
      "priorityText": "Medium",
      "timeSpecified": true,
      "context": "Focus on mobile responsiveness"
    },
    {
      "title": "Follow up with client about project requirements",
      "assignee": "Rajeev",
      "dueDate": "2025-06-22T17:00:00.000Z",
      "dueDateFormatted": "June 22, 2025",
      "dueTimeFormatted": null,
      "priority": "P3",
      "priorityText": "Medium",
      "timeSpecified": false,
      "context": "Ask about budget constraints"
    }
  ]
}`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.1, // Lower temperature for more deterministic results
        max_tokens: 2000, // Increased token limit for more detailed responses
        response_format: { type: "json_object" } // Ensure response is valid JSON
      });
      
      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }
      
      // Parse the JSON response
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', content);
        throw new Error('Invalid JSON response from OpenAI');
      }
      
      // Validate the response structure
      if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
        throw new Error('Invalid response structure from OpenAI');
      }
      
      // Process each task to ensure dates are valid
      return parsed.tasks.map((task: any) => {
        // Ensure the date is in the future if it's not already
        let dueDate;
        try {
          dueDate = new Date(task.dueDate);
          const currentTime = new Date();
          
          // If the date is in the past, add years until it's in the future
          // but preserve the exact time components and ensure IST timezone
          if (dueDate < currentTime && !isNaN(dueDate.getTime())) {
            // Extract time components
            const hours = dueDate.getHours();
            const minutes = dueDate.getMinutes();
            const seconds = dueDate.getSeconds();
            
            // Add a year
            dueDate.setFullYear(dueDate.getFullYear() + 1);
            
            // Restore the exact time components
            dueDate.setHours(hours, minutes, seconds, 0);
          }
          
          // Ensure the time is preserved exactly as specified by the user
          // This is important for IST timezone handling
        } catch (dateError) {
          // If date parsing fails, set to tomorrow
          dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 1);
          console.warn('Invalid date format, defaulting to tomorrow:', task.dueDate);
        }
        
        // Determine if time was specified based on the presence of dueTimeFormatted
        const timeSpecified = !!task.dueTimeFormatted;
        
        return {
          title: task.title || 'Untitled Task',
          assignee: task.assignee || '',
          dueDate: dueDate.toISOString(),
          priority: task.priority || 'P3',
          dueDateFormatted: task.dueDateFormatted || 'Tomorrow',
          dueTimeFormatted: task.dueTimeFormatted || null,
          timeSpecified,
          priorityText: task.priorityText || 'Medium',
          context: task.context || ''
        };
      });
    } catch (error) {
      console.error('OpenAI parsing error:', error);
      throw error;
    }
  }
  
  /**
   * Fallback method to parse tasks if OpenAI API is not available
   * @param text Meeting minutes text
   * @returns Array of parsed tasks
   */
  fallbackParseMultipleTasks(text: string): ParsedTask[] {
    // Use the local parser as a fallback
    const { parseMultipleTasks } = require('./meetingMinutesParser');
    return parseMultipleTasks(text);
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
            - priorityText: Human-readable priority (e.g., "Urgent", "High", "Medium", "Low")
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
            - P1 (Urgent): Urgent/emergency tasks, ASAP, critical deadlines
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
              "priority": "P3",
              "priorityText": "Medium",
              "priorityReason": "Using default priority as no urgency was specified"
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

// These functions are kept for backward compatibility but enhanced for development

// Save API key - now logs a warning and doesn't save to localStorage
export const saveApiKey = (key: string): void => {
  if (!key || !key.trim()) {
    console.warn('Empty API key provided');
    return;
  }
  
  console.warn('Saving API key to localStorage is deprecated. Please use environment variable VITE_OPENAI_API_KEY instead.');
  // No longer saving to localStorage
};
