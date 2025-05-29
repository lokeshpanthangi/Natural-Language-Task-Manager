import { ParsedTask } from '../types/Task';
import { parseNaturalLanguage } from './nlpParser';

/**
 * Parses meeting minutes to extract multiple tasks
 * @param text The meeting minutes text to parse
 * @returns Array of parsed tasks
 */
export function parseMultipleTasks(text: string): ParsedTask[] {
  const tasks: ParsedTask[] = [];
  
  // Preprocess the text to handle common patterns
  const preprocessedText = preprocessText(text);
  
  // Split text into sentences and potential task segments
  const segments = preprocessedText.split(/[.!?]\s+/);
  
  // Process each segment to see if it contains a task
  for (const segment of segments) {
    if (segment.trim() === '') continue;
    
    // Check if segment likely contains a task assignment
    if (containsTaskAssignment(segment)) {
      try {
        // Extract potential assignee before parsing
        const assignee = extractAssignee(segment);
        
        // Extract task description
        const taskDescription = extractTaskDescription(segment, assignee);
        
        // Extract due date
        const dueDate = extractDueDate(segment);
        
        // Extract priority
        const priority = extractPriority(segment);
        
        // Create a more structured sentence for the NLP parser
        const structuredSentence = createStructuredSentence(taskDescription, assignee, dueDate, priority);
        
        // Try to parse the structured sentence as a task
        const parsedTask = parseNaturalLanguage(structuredSentence);
        
        // Ensure the assignee is preserved if it was extracted
        if (assignee && !parsedTask.assignee) {
          parsedTask.assignee = assignee;
        }
        
        // Only add if we have a title
        if (parsedTask.title) {
          tasks.push(parsedTask);
        }
      } catch (error) {
        console.error('Error parsing task from segment:', segment, error);
        // Continue to next segment even if this one fails
      }
    }
  }
  
  return tasks;
}

/**
 * Preprocesses text to handle common meeting transcript patterns
 * @param text The text to preprocess
 * @returns Preprocessed text
 */
function preprocessText(text: string): string {
  let processed = text;
  
  // Replace common speaker indicators
  processed = processed.replace(/\[([^\]]+)\]:\s*/g, '$1: ');
  processed = processed.replace(/\(([^\)]+)\):\s*/g, '$1: ');
  
  // Handle timestamps often found in transcripts
  processed = processed.replace(/\[\d{1,2}:\d{2}(:\d{2})?\]/g, ' ');
  processed = processed.replace(/\(\d{1,2}:\d{2}(:\d{2})?\)/g, ' ');
  
  // Handle speaker turns with line breaks
  processed = processed.replace(/\n([A-Za-z]+):\s*/g, '. $1: ');
  
  // Normalize periods to ensure sentence splitting works
  processed = processed.replace(/\.{2,}/g, '.');
  
  // Ensure proper spacing after punctuation
  processed = processed.replace(/([.!?])([A-Za-z])/g, '$1 $2');
  
  return processed;
}

/**
 * Checks if a sentence likely contains a task assignment
 * @param sentence The sentence to check
 * @returns True if the sentence likely contains a task assignment
 */
function containsTaskAssignment(sentence: string): boolean {
  const taskIndicators = [
    'take', 'do', 'finish', 'complete', 'handle', 'prepare', 'create',
    'make', 'write', 'review', 'check', 'update', 'send', 'share',
    'follow up', 'follow-up', 'followup', 'get back', 'call', 'email',
    'schedule', 'organize', 'arrange', 'book', 'reserve', 'confirm',
    'please', 'need to', 'should', 'must', 'will', 'would', 'could',
    'assigned', 'responsible', 'in charge', 'work on', 'develop'
  ];
  
  // Check for task indicators
  const hasTaskIndicator = taskIndicators.some(indicator => 
    sentence.toLowerCase().includes(indicator));
  
  // Check for time indicators
  const hasTimeIndicator = [
    'by', 'before', 'after', 'tomorrow', 'today', 'tonight', 'next',
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'week', 'month', 'morning', 'afternoon', 'evening', 'noon', 'day',
    'deadline', 'due', 'eod', 'eow', 'end of', 'cob', 'asap'
  ].some(indicator => sentence.toLowerCase().includes(indicator));
  
  // Check for assignee indicators
  const hasAssigneeIndicator = sentence.includes(':') || 
    /\b(you|he|she|they|we)\b/i.test(sentence) ||
    /\b[A-Z][a-z]+\b/.test(sentence) || // Capitalized names
    sentence.toLowerCase().includes('assigned to');
  
  // More lenient check - if it has a name and any task indicator, it's likely a task
  if (/\b[A-Z][a-z]+\b/.test(sentence) && hasTaskIndicator) {
    return true;
  }
  
  return hasTaskIndicator && (hasTimeIndicator || hasAssigneeIndicator);
}

/**
 * Extracts assignee from a sentence based on common patterns
 * @param sentence The sentence to extract from
 * @returns The extracted assignee or empty string
 */
function extractAssignee(sentence: string): string {
  // Check for explicit assignee format: "Name: task description"
  const explicitAssigneeMatch = sentence.match(/^([A-Za-z\s]+):\s*(.+)$/i);
  if (explicitAssigneeMatch) {
    return explicitAssigneeMatch[1].trim();
  }
  
  // Check for "Name, please/will/should" format
  const nameFirstMatch = sentence.match(/^([A-Z][a-z]+)\s+(please|will|should|can|could|would|must|need to)/i);
  if (nameFirstMatch) {
    return nameFirstMatch[1].trim();
  }
  
  // Check for "Name you" format (e.g., "John you need to...")
  const nameYouMatch = sentence.match(/^([A-Z][a-z]+)\s+you\b/i);
  if (nameYouMatch) {
    return nameYouMatch[1].trim();
  }
  
  // Check for assignee in the format "assignee to/will/should"
  const assigneeMatch = sentence.match(/\b([A-Z][a-z]+)\s+(to|will|should|can|please)\b/i);
  if (assigneeMatch) {
    return assigneeMatch[1].trim();
  }
  
  // Common patterns for assignee extraction
  const patterns = [
    // Name followed by action
    /(\w+)\s+(will|should|to|needs to|has to|must|can you|could you|would you|please)/i,
    
    // Action assigned to name
    /(assigned to|give to|for|goes to)\s+(\w+)/i,
    
    // Name with possessive
    /(\w+)'s\s+(task|job|responsibility|assignment)/i
  ];
  
  for (const pattern of patterns) {
    const match = sentence.match(pattern);
    if (match && match[1]) {
      // Return the captured name, capitalized
      return match[1].charAt(0).toUpperCase() + match[1].slice(1);
    }
  }
  
  return '';
}

// Export the extractAssignee function for use in other modules if needed
export { extractAssignee };

/**
 * Extracts the task description from a segment
 * @param segment The text segment
 * @param assignee The already extracted assignee
 * @returns The extracted task description
 */
function extractTaskDescription(segment: string, assignee: string): string {
  let description = segment;
  
  // Remove assignee prefix if present
  if (assignee && description.startsWith(assignee)) {
    description = description.substring(assignee.length).trim();
    // Remove any colon after the assignee
    if (description.startsWith(':')) {
      description = description.substring(1).trim();
    }
  }
  
  // Remove common prefixes that aren't part of the actual task
  const prefixesToRemove = [
    'please', 'can you', 'could you', 'will you', 'would you',
    'you need to', 'you should', 'you must', 'you will', 'you have to',
    'need to', 'should', 'must', 'will', 'have to'
  ];
  
  for (const prefix of prefixesToRemove) {
    if (description.toLowerCase().startsWith(prefix)) {
      description = description.substring(prefix.length).trim();
    }
  }
  
  // Remove due date information from the description
  const dueDatePatterns = [
    /\bby\s+([^,\.]+)/i,
    /\bbefore\s+([^,\.]+)/i,
    /\bdue\s+([^,\.]+)/i,
    /\bdeadline\s+([^,\.]+)/i,
    /\bon\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
  ];
  
  for (const pattern of dueDatePatterns) {
    description = description.replace(pattern, '');
  }
  
  // Clean up any double spaces
  description = description.replace(/\s+/g, ' ').trim();
  
  return description;
}

/**
 * Creates a structured sentence for the NLP parser
 * @param taskDescription The task description
 * @param assignee The assignee
 * @param dueDate The due date
 * @param priority The priority
 * @returns A structured sentence
 */
function createStructuredSentence(
  taskDescription: string,
  assignee: string,
  dueDate: string,
  priority: string
): string {
  let sentence = taskDescription;
  
  // Add assignee if available
  if (assignee) {
    sentence += ` assigned to ${assignee}`;
  }
  
  // Add due date if available
  if (dueDate) {
    sentence += ` by ${dueDate}`;
  }
  
  // Add priority if available
  if (priority) {
    sentence += ` with ${priority} priority`;
  }
  
  return sentence;
}

/**
 * Extracts priority from text
 * @param text The text to extract priority from
 * @returns Priority level (P1, P2, P3, or P4)
 */
function extractPriority(text: string): 'P1' | 'P2' | 'P3' | 'P4' {
  // Check for explicit priority mentions
  const priorityMatch = text.match(/\b(p[1-4]|priority\s*[1-4]|high\s*priority|medium\s*priority|low\s*priority)\b/i);
  
  if (priorityMatch) {
    const priority = priorityMatch[1].toLowerCase();
    
    if (priority.includes('p1') || priority.includes('priority 1') || priority.includes('high priority')) {
      return 'P1';
    } else if (priority.includes('p2') || priority.includes('priority 2')) {
      return 'P2';
    } else if (priority.includes('p3') || priority.includes('priority 3') || priority.includes('medium priority')) {
      return 'P3';
    } else if (priority.includes('p4') || priority.includes('priority 4') || priority.includes('low priority')) {
      return 'P4';
    }
  }
  
  // Check for urgent/critical indicators
  if (/\b(urgent|critical|asap|immediately|right away)\b/i.test(text)) {
    return 'P1';
  }
  
  // Check for important indicators
  if (/\b(important|significant|key|major)\b/i.test(text)) {
    return 'P2';
  }
  
  // Default priority is P3 (medium)
  return 'P3';
}

/**
 * Extracts a due date from text using various date formats and relative dates
 * @param text The text to extract the date from
 * @returns A date string in ISO format or empty string if no date found
 */
function extractDueDate(text: string): string {
  // First check if we can extract a date string
  const dateString = extractDateString(text);
  if (!dateString) {
    return '';
  }
  
  const now = new Date();
  let dueDate = new Date();
  
  // Check for common date patterns
  
  // "Tomorrow"
  if (/\btomorrow\b/i.test(dateString)) {
    dueDate.setDate(now.getDate() + 1);
  }
  // "Tonight"
  else if (/\btonight\b/i.test(dateString)) {
    dueDate.setHours(20, 0, 0, 0); // 8:00 PM
  }
  // "Today"
  else if (/\btoday\b/i.test(dateString)) {
    // Keep the current date, just update time if specified
  }
  // "Next week"
  else if (/\bnext week\b/i.test(dateString)) {
    dueDate.setDate(now.getDate() + 7);
  }
  // "This week"
  else if (/\bthis week\b/i.test(dateString)) {
    // Set to Friday of current week
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const daysToFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 6; // Friday is 5
    dueDate.setDate(now.getDate() + daysToFriday);
  }
  // "End of day/week/month"
  else if (/\bend of (day|week|month)\b/i.test(dateString)) {
    const eodMatch = dateString.match(/\bend of (day|week|month)\b/i);
    if (eodMatch) {
      const period = eodMatch[1].toLowerCase();
      if (period === 'day') {
        dueDate.setHours(17, 0, 0, 0); // 5:00 PM
      } else if (period === 'week') {
        const dayOfWeek = now.getDay();
        const daysToFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 6;
        dueDate.setDate(now.getDate() + daysToFriday);
        dueDate.setHours(17, 0, 0, 0); // 5:00 PM Friday
      } else if (period === 'month') {
        // Last day of current month
        dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        dueDate.setHours(17, 0, 0, 0); // 5:00 PM
      }
    }
  }
  // Common abbreviations
  else if (/\b(eod|eow|eom|cob)\b/i.test(dateString)) {
    const abbr = dateString.match(/\b(eod|eow|eom|cob)\b/i)[1].toLowerCase();
    if (abbr === 'eod' || abbr === 'cob') {
      dueDate.setHours(17, 0, 0, 0); // 5:00 PM today
    } else if (abbr === 'eow') {
      const dayOfWeek = now.getDay();
      const daysToFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 6;
      dueDate.setDate(now.getDate() + daysToFriday);
      dueDate.setHours(17, 0, 0, 0); // 5:00 PM Friday
    } else if (abbr === 'eom') {
      // Last day of current month
      dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dueDate.setHours(17, 0, 0, 0); // 5:00 PM
    }
  }
  // Days of the week
  else if (/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(dateString)) {
    const dayMatch = dateString.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
    if (dayMatch) {
      const targetDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        .indexOf(dayMatch[1].toLowerCase());
      
      const currentDay = now.getDay();
      let daysToAdd = targetDay - currentDay;
      
      // If the day has already passed this week, go to next week
      if (daysToAdd <= 0) {
        daysToAdd += 7;
      }
      
      dueDate.setDate(now.getDate() + daysToAdd);
    }
  }
  
  // Check for time patterns
  const timeMatch = dateString.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const period = timeMatch[3] ? timeMatch[3].toLowerCase() : null;
    
    // Adjust for AM/PM
    if (period === 'pm' && hours < 12) {
      hours += 12;
    } else if (period === 'am' && hours === 12) {
      hours = 0;
    }
    
    dueDate.setHours(hours, minutes, 0, 0);
  }
  
  return dueDate.toISOString();
}

/**
 * Extracts a date string from text
 * @param text The text to extract from
 * @returns The extracted date string or empty string if not found
 */
function extractDateString(text: string): string {
  // Look for common date patterns
  const datePatterns = [
    // By specific time
    { pattern: /\bby\s+(\d{1,2}(am|pm|:\d{2}))/i, group: 1 },
    { pattern: /\bby\s+(\d{1,2}:\d{2}\s*(?:am|pm)?)/i, group: 1 },
    
    // By specific day
    { pattern: /\bby\s+(today|tomorrow|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, group: 1 },
    { pattern: /\bby\s+(next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))/i, group: 1 },
    
    // Due on specific day
    { pattern: /\bdue\s+(today|tomorrow|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, group: 1 },
    
    // On specific day
    { pattern: /\bon\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, group: 1 },
    
    // This/next week/month
    { pattern: /\b(this|next)\s+(week|month)/i, group: 0 },
    
    // Common deadline abbreviations
    { pattern: /\b(eod|eow|eom|cob|asap)\b/i, group: 1 },
    
    // End of day/week/month
    { pattern: /\bend of (day|week|month)\b/i, group: 0 }
  ];
  
  for (const { pattern, group } of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[group].trim();
    }
  }
  
  return '';
}

// Export the extractDueDate function for use in other modules if needed
export { extractDueDate };

// Export the extractPriority function for use in other modules if needed
export { extractPriority };
