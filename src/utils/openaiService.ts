
import OpenAI from 'openai';
import { ParsedTask } from '../types/Task';

export class OpenAIService {
  private openai: OpenAI | null = null;

  constructor(apiKey: string) {
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
    }
  }

  async parseTaskWithAI(input: string): Promise<ParsedTask | null> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a task management assistant. Parse the user's task description and extract structured information. Always respond with a valid JSON object containing these fields:
            - title: A clear, concise task title (string)
            - assignee: The person assigned (string, can be empty if not specified)
            - dueDate: ISO date string (default to tomorrow 5PM if not specified)
            - priority: One of "P1", "P2", "P3", "P4" (P3 is default, P1 is highest priority)

            Consider these priority guidelines:
            - P1: Urgent/emergency tasks, ASAP, critical deadlines
            - P2: Important tasks, high priority
            - P3: Normal priority (default)
            - P4: Low priority, nice to have

            Example response:
            {
              "title": "Review proposal",
              "assignee": "John",
              "dueDate": "2024-01-15T17:00:00.000Z",
              "priority": "P2"
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

      return {
        title: parsed.title,
        assignee: parsed.assignee || '',
        dueDate: parsed.dueDate,
        priority: parsed.priority
      };
    } catch (error) {
      console.error('OpenAI parsing error:', error);
      throw error;
    }
  }
}

// Storage functions for API key
export const saveApiKey = (key: string): void => {
  localStorage.setItem('openai_api_key', key);
};

export const getApiKey = (): string | null => {
  return localStorage.getItem('openai_api_key');
};

export const clearApiKey = (): void => {
  localStorage.removeItem('openai_api_key');
};
