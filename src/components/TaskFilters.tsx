import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, X, Flag, User, Calendar, Check } from 'lucide-react';
import { Task, TaskFilters as FilterType } from '../types/Task';

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

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      priority: '',
      assignee: '',
      status: '',
      sortBy: 'dueDate'
    });
  };

  const hasActiveFilters = filters.search || filters.priority || filters.assignee || filters.status;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'text-red-600 bg-red-100 border-red-200';
      case 'P2': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'P3': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'P4': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
          <div className="relative">
            <select
              value={filters.priority}
              onChange={(e) => onFiltersChange({...filters, priority: e.target.value})}
              className="w-full appearance-none bg-white pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Priorities</option>
              <option value="P1" className="text-red-600">P1 (Urgent)</option>
              <option value="P2" className="text-orange-600">P2 (High)</option>
              <option value="P3" className="text-blue-600">P3 (Medium)</option>
              <option value="P4" className="text-green-600">P4 (Low)</option>
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Flag className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          {/* Assignee Filter */}
          <select
            value={filters.assignee}
            onChange={(e) => onFiltersChange({...filters, assignee: e.target.value})}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
          >
            <option value="">All Assignees</option>
            {uniqueAssignees.map(assignee => (
              <option key={assignee} value={assignee}>{assignee}</option>
            ))}
          </select>

          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => onFiltersChange({...filters, status: e.target.value})}
              className="w-full appearance-none bg-white pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="pending" className="text-amber-600">Pending</option>
              <option value="in-progress" className="text-blue-600">In Progress</option>
              <option value="completed" className="text-emerald-600">Completed</option>
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Check className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-slate-500" />
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

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-200 animate-fade-in">
              <span className="text-sm text-slate-500">Active Filters:</span>
              
              {filters.search && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 shadow-sm">
                  <Search className="w-3 h-3 mr-1 text-slate-500" />
                  Search: {filters.search}
                  <button 
                    onClick={() => onFiltersChange({...filters, search: ''})}
                    className="ml-1 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {filters.priority && (
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border shadow-sm ${getPriorityColor(filters.priority)}`}>
                  <Flag className="w-3 h-3 mr-1" />
                  Priority: {filters.priority}
                  <button 
                    onClick={() => onFiltersChange({...filters, priority: ''})}
                    className="ml-1 hover:text-slate-700 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {filters.assignee && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 shadow-sm">
                  <User className="w-3 h-3 mr-1 text-purple-500" />
                  Assignee: {filters.assignee}
                  <button 
                    onClick={() => onFiltersChange({...filters, assignee: ''})}
                    className="ml-1 text-purple-500 hover:text-purple-700 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {filters.status && (
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${filters.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : filters.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                  <Check className="w-3 h-3 mr-1" />
                  Status: {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
                  <button 
                    onClick={() => onFiltersChange({...filters, status: ''})}
                    className="ml-1 hover:text-slate-700 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              <button 
                onClick={clearAllFilters}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline ml-auto transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
