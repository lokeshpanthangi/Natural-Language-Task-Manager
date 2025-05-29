
export interface Task {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  description?: string;
}

export interface TaskFilters {
  search: string;
  priority: string;
  assignee: string;
  status: string;
  sortBy: 'dueDate' | 'priority' | 'assignee' | 'createdAt';
}

export interface ParsedTask {
  title: string;
  assignee: string;
  dueDate: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  dueDateFormatted?: string;
  dueTimeFormatted?: string | null;
  timeSpecified?: boolean;
  priorityText?: string;
  priorityReason?: string;
}
