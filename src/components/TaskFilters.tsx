
import React from 'react';
import { Search, Filter, SortAsc, X } from 'lucide-react';
import { TaskFilters as FilterType, Task } from '../types/Task';

interface TaskFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  tasks: Task[];
}

const TaskFilters: React.FC<TaskFiltersProps> = ({ filters, onFiltersChange, tasks }) => {
  const uniqueAssignees = Array.from(new Set(tasks.map(task => task.assignee).filter(Boolean)));
  
  const clearFilters = () => {
    onFiltersChange({
      search: '',
      priority: '',
      assignee: '',
      status: '',
      sortBy: 'dueDate'
    });
  };

  const hasActiveFilters = filters.search || filters.priority || filters.assignee || filters.status;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tasks or assignees..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) => onFiltersChange({ ...filters, priority: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
          >
            <option value="">All Priorities</option>
            <option value="P1">P1 - Urgent</option>
            <option value="P2">P2 - Important</option>
            <option value="P3">P3 - Normal</option>
            <option value="P4">P4 - Low</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={filters.assignee}
            onChange={(e) => onFiltersChange({ ...filters, assignee: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
          >
            <option value="">All Assignees</option>
            {uniqueAssignees.map(assignee => (
              <option key={assignee} value={assignee}>{assignee}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center space-x-2">
            <SortAsc className="w-4 h-4 text-slate-500" />
            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as any })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="assignee">Assignee</option>
              <option value="createdAt">Created</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2 text-sm text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors duration-200"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-600">Active filters:</span>
          {filters.search && (
            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Search: "{filters.search}"
            </span>
          )}
          {filters.priority && (
            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              Priority: {filters.priority}
            </span>
          )}
          {filters.assignee && (
            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Assignee: {filters.assignee}
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
              Status: {filters.status}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskFilters;
