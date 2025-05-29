import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, User, Flag, Clock, AlertCircle } from 'lucide-react';
import { Task } from '../types/Task';

interface TaskEditModalProps {
  task: Task;
  onSave: (task: Task) => void;
  onCancel: () => void;
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({ task, onSave, onCancel }) => {
  const [editedTask, setEditedTask] = useState<Task>({...task});
  
  // Reset form when task changes
  useEffect(() => {
    setEditedTask({...task});
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure the dueDate is valid
    let dueDate = new Date(editedTask.dueDate);
    if (isNaN(dueDate.getTime())) {
      dueDate = new Date();
    }
    
    const updatedTask = {
      ...editedTask,
      dueDate: dueDate.toISOString()
    };
    
    onSave(updatedTask);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'text-red-600 bg-red-100 border-red-200';
      case 'P2': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'P3': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'P4': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-blue-600 bg-blue-100 border-blue-200';
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Edit Task</h2>
          </div>
          <button 
            onClick={onCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="mb-5">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertCircle className="w-3 h-3 text-blue-600" />
              </div>
              <label htmlFor="title" className="text-sm font-medium text-slate-700">
                Task Title
              </label>
            </div>
            <input
              id="title"
              type="text"
              value={editedTask.title}
              onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter task title"
              required
            />
          </div>
          
          {/* Assignee */}
          <div className="mb-5">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                <User className="w-3 h-3 text-purple-600" />
              </div>
              <label htmlFor="assignee" className="text-sm font-medium text-slate-700">
                Assignee
              </label>
            </div>
            <input
              id="assignee"
              type="text"
              value={editedTask.assignee}
              onChange={(e) => setEditedTask({...editedTask, assignee: e.target.value})}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="Who is responsible for this task?"
            />
          </div>
          
          {/* Due Date */}
          <div className="mb-5">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                <Calendar className="w-3 h-3 text-emerald-600" />
              </div>
              <label htmlFor="dueDate" className="text-sm font-medium text-slate-700">
                Due Date & Time
              </label>
            </div>
            <input
              id="dueDate"
              type="datetime-local"
              value={new Date(editedTask.dueDate).toISOString().slice(0, 16)}
              onChange={(e) => {
                const date = new Date(e.target.value);
                setEditedTask({...editedTask, dueDate: date.toISOString()});
              }}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-5">
            {/* Priority */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                  <Flag className="w-3 h-3 text-amber-600" />
                </div>
                <label htmlFor="priority" className="text-sm font-medium text-slate-700">
                  Priority
                </label>
              </div>
              <select
                id="priority"
                value={editedTask.priority}
                onChange={(e) => setEditedTask({...editedTask, priority: e.target.value as any})}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              >
                <option value="P1">P1 (Urgent)</option>
                <option value="P2">P2 (High)</option>
                <option value="P3">P3 (Medium)</option>
                <option value="P4">P4 (Low)</option>
              </select>
            </div>
            
            {/* Status */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Clock className="w-3 h-3 text-indigo-600" />
                </div>
                <label htmlFor="status" className="text-sm font-medium text-slate-700">
                  Status
                </label>
              </div>
              <select
                id="status"
                value={editedTask.status}
                onChange={(e) => setEditedTask({...editedTask, status: e.target.value as any})}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          
          {/* Description (optional) */}
          <div className="mb-5">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                <AlertCircle className="w-3 h-3 text-slate-600" />
              </div>
              <label htmlFor="description" className="text-sm font-medium text-slate-700">
                Description (optional)
              </label>
            </div>
            <textarea
              id="description"
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 min-h-[100px] transition-colors"
              placeholder="Add any additional details about this task..."
            />
          </div>
          
          {/* Priority Badge Preview */}
          <div className="mb-5 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-2">Priority Badge Preview:</p>
            <div className="flex justify-center">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getPriorityColor(editedTask.priority)}`}>
                <Flag className="w-4 h-4 mr-1.5" />
                {editedTask.priority} - {editedTask.priority === 'P1' ? 'Urgent' : 
                                       editedTask.priority === 'P2' ? 'High' : 
                                       editedTask.priority === 'P3' ? 'Medium' : 'Low'}
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskEditModal;
