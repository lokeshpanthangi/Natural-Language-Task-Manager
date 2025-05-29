
import React, { useState } from 'react';
import { Calendar, User, Flag, Clock, Edit, Trash2, Check } from 'lucide-react';
import { Task } from '../types/Task';

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-500 border-red-500 text-red-700';
      case 'P2': return 'bg-orange-500 border-orange-500 text-orange-700';
      case 'P3': return 'bg-teal-500 border-teal-500 text-teal-700';
      case 'P4': return 'bg-gray-500 border-gray-500 text-gray-700';
      default: return 'bg-teal-500 border-teal-500 text-teal-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Tomorrow ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays === -1) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays < 0) {
      return `${Math.abs(diffDays)} days ago`;
    } else if (diffDays <= 7) {
      return `In ${diffDays} days`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  const isOverdue = () => {
    return new Date(task.dueDate) < new Date() && task.status !== 'completed';
  };

  const handleSave = () => {
    onUpdate(editedTask);
    setIsEditing(false);
  };

  const handleStatusToggle = () => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    onUpdate({ ...task, status: newStatus });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
      task.status === 'completed' ? 'border-emerald-200 bg-emerald-50/30' : 
      isOverdue() ? 'border-red-200 bg-red-50/30' : 'border-slate-200'
    }`}>
      <div className="p-5">
        {/* Priority Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority).split(' ')[0]}`}></div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleStatusToggle}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                task.status === 'completed' 
                  ? 'bg-emerald-500 border-emerald-500' 
                  : 'border-slate-300 hover:border-emerald-500'
              }`}
            >
              {task.status === 'completed' && <Check className="w-3 h-3 text-white" />}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              <Edit className="w-3 h-3 text-slate-600" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center hover:border-red-500 hover:bg-red-50 transition-all duration-200"
            >
              <Trash2 className="w-3 h-3 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Task Title */}
        {isEditing ? (
          <input
            value={editedTask.title}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            className="w-full text-lg font-semibold text-slate-900 bg-transparent border-b border-slate-300 focus:border-emerald-500 outline-none mb-3"
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
        ) : (
          <h3 className={`text-lg font-semibold mb-3 ${
            task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'
          }`}>
            {task.title}
          </h3>
        )}

        {/* Task Details */}
        <div className="space-y-3">
          {/* Assignee */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {task.assignee ? getInitials(task.assignee) : <User className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                {task.assignee || 'Unassigned'}
              </p>
              <p className="text-xs text-slate-500">Assignee</p>
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isOverdue() ? 'bg-red-100' : 'bg-emerald-100'
            }`}>
              <Calendar className={`w-4 h-4 ${isOverdue() ? 'text-red-600' : 'text-emerald-600'}`} />
            </div>
            <div>
              <p className={`text-sm font-medium ${isOverdue() ? 'text-red-700' : 'text-slate-900'}`}>
                {formatDueDate(task.dueDate)}
              </p>
              <p className="text-xs text-slate-500">Due date</p>
            </div>
          </div>

          {/* Priority & Status */}
          <div className="flex items-center justify-between pt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
              <Flag className="w-3 h-3 mr-1" />
              {task.priority}
            </span>
            
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
              <Clock className="w-3 h-3 mr-1" />
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
