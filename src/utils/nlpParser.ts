import { ParsedTask } from '../types/Task';

// Helper function to ensure a date is in the future
const ensureFutureDate = (date: Date): Date => {
  const now = new Date();
  
  // If the date is in the past (comparing year, month, and day only)
  const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowWithoutTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (dateWithoutTime < nowWithoutTime) {
    // If the date is today but with a time that's in the past, just set it to tomorrow
    if (dateWithoutTime.getTime() === nowWithoutTime.getTime() && date < now) {
      date.setDate(date.getDate() + 1);
    } else {
      // Otherwise, increment the year
      date.setFullYear(date.getFullYear() + 1);
    }
  }
  
  return date;
};

// Helper function to format date in a consistent way
const formatDateForDisplay = (date: Date, timeSpecified: boolean): { formattedDate: string, formattedTime: string | null } => {
  const formattedDate = date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  // Only return time if it was explicitly specified
  const formattedTime = timeSpecified ? date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }) : null;
  
  return { formattedDate, formattedTime };
};

export const parseNaturalLanguage = (input: string): ParsedTask => {
  const text = input.toLowerCase();
  
  // Extract task title (everything before 'for', 'by', 'with', assignee names, or priority)
  let title = input;
  const stopWords = ['for', 'by', 'with', 'p1', 'p2', 'p3', 'p4', 'tomorrow', 'today', 'next week', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  // Find the first occurrence of stop words or common names
  const commonNames = ['john', 'jane', 'alex', 'sarah', 'mike', 'lisa', 'tom', 'anna', 'david', 'emma', 'aman', 'rajeev', 'priya', 'raj', 'neha', 'amit', 'sanya', 'rohit'];
  
  for (const word of stopWords.concat(commonNames)) {
    const index = text.indexOf(word);
    if (index > 0) {
      title = input.substring(0, index).trim();
      break;
    }
  }

  // Extract assignee - look for names after 'for', 'with', or common name patterns
  let assignee = '';
  const assigneePatterns = [
    /(?:for|with)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/i,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g
  ];
  
  for (const pattern of assigneePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      if (pattern.source.includes('for|with')) {
        assignee = matches[0].replace(/(?:for|with)\s+/i, '').trim();
        break;
      } else {
        // Extract proper names (capitalized words)
        const names = input.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g);
        if (names && names.length > 0) {
          assignee = names[0];
          break;
        }
      }
    }
  }

  // Extract due date and time
  let dueDate = new Date();
  dueDate.setHours(17, 0, 0, 0); // Default to 5 PM today

  // Time patterns
  const timePatterns = [
    /(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i,
    /(?:at\s+)?(\d{1,2})(?::(\d{2}))?(?:\s*(am|pm))?/i
  ];

  let extractedTime = { hour: 17, minute: 0 };
  let timeSpecified = false; // Track if time was explicitly specified

  for (const pattern of timePatterns) {
    const timeMatch = text.match(pattern);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const ampm = timeMatch[3]?.toLowerCase();
      
      // Proper AM/PM handling
      if (ampm === 'pm' && hour < 12) hour += 12;
      if (ampm === 'am' && hour === 12) hour = 0;
      
      // Validate hour and minute
      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        extractedTime = { hour, minute };
        timeSpecified = true; // Time was explicitly specified
      }
      break;
    }
  }

  // Date patterns
  if (text.includes('tomorrow')) {
    dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
  } else if (text.includes('today')) {
    dueDate = new Date();
  } else if (text.includes('next week')) {
    dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
  } else {
    // Look for specific dates like "20th June", "June 20", "6/20", etc.
    const datePatterns = [
      /(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?/i,
      /(\d{1,2})\/(\d{1,2})/,
      /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
    ];

    for (const pattern of datePatterns) {
      const dateMatch = text.match(pattern);
      if (dateMatch) {
        if (pattern.source.includes('january|february')) {
          // Month name patterns
          const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
          let month, day;
          
          if (dateMatch[1] && !isNaN(parseInt(dateMatch[1]))) {
            day = parseInt(dateMatch[1]);
            month = monthNames.indexOf(dateMatch[2].toLowerCase());
          } else {
            month = monthNames.indexOf(dateMatch[1].toLowerCase());
            day = parseInt(dateMatch[2]);
          }
          
          dueDate = new Date();
          dueDate.setMonth(month);
          dueDate.setDate(day);
          // Ensure the date is in the future
          dueDate = ensureFutureDate(dueDate);
        } else if (pattern.source.includes('/')) {
          // MM/DD format
          const month = parseInt(dateMatch[1]) - 1;
          const day = parseInt(dateMatch[2]);
          dueDate = new Date();
          dueDate.setMonth(month);
          dueDate.setDate(day);
          // Ensure the date is in the future
          dueDate = ensureFutureDate(dueDate);
        } else if (pattern.source.includes('monday|tuesday')) {
          // Day of week
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const targetDay = dayNames.indexOf(dateMatch[1].toLowerCase());
          const today = new Date().getDay();
          const daysUntilTarget = (targetDay - today + 7) % 7 || 7;
          
          dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + daysUntilTarget);
        }
        break;
      }
    }
  }

  // Set the extracted time
  dueDate.setHours(extractedTime.hour, extractedTime.minute, 0, 0);

  // Extract priority
  let priority: 'P1' | 'P2' | 'P3' | 'P4' = 'P3'; // Default to P3 (Medium)
  const priorityMatch = text.match(/p([1-4])/i);
  if (priorityMatch) {
    priority = `P${priorityMatch[1]}` as 'P1' | 'P2' | 'P3' | 'P4';
  } else if (text.includes('urgent') || text.includes('asap') || text.includes('emergency')) {
    priority = 'P1';
  } else if (text.includes('important') || text.includes('high priority')) {
    priority = 'P2';
  } else if (text.includes('low priority') || text.includes('whenever')) {
    priority = 'P4';
  }

  // Ensure the date is in the future and format it for display
  dueDate = ensureFutureDate(dueDate);
  const { formattedDate, formattedTime } = formatDateForDisplay(dueDate, timeSpecified);
  
  // Determine priority text and reason
  const priorityText = priority === 'P1' ? 'High' : 
                      priority === 'P2' ? 'Medium-High' : 
                      priority === 'P3' ? 'Medium' : 'Low';
                      
  let priorityReason = 'Inferred based on task description';
  if (priority === 'P1') {
    priorityReason = 'Inferred as high priority due to specific deadline and urgency';
  } else if (priority === 'P2') {
    priorityReason = 'Inferred as medium-high priority based on task importance';
  }

  return {
    title: title.trim() || input.trim(),
    assignee: assignee || '',
    dueDate: dueDate.toISOString(),
    priority,
    dueDateFormatted: formattedDate,
    dueTimeFormatted: formattedTime,
    timeSpecified,
    priorityText,
    priorityReason
  };
};
