import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Edit Task</h2>
          <button 
            onClick={onCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Task Title
            </label>
            <input
              id="title"
              type="text"
              value={editedTask.title}
              onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          
          {/* Assignee */}
          <div>
            <label htmlFor="assignee" className="block text-sm font-medium text-slate-700 mb-1">
              Assignee
            </label>
            <input
              id="assignee"
              type="text"
              value={editedTask.assignee}
              onChange={(e) => setEditedTask({...editedTask, assignee: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 mb-1">
              Due Date
            </label>
            <input
              id="dueDate"
              type="datetime-local"
              value={new Date(editedTask.dueDate).toISOString().slice(0, 16)}
              onChange={(e) => {
                const date = new Date(e.target.value);
                setEditedTask({...editedTask, dueDate: date.toISOString()});
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          
          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              value={editedTask.priority}
              onChange={(e) => setEditedTask({...editedTask, priority: e.target.value as any})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="P1">P1 (Urgent)</option>
              <option value="P2">P2 (High)</option>
              <option value="P3">P3 (Medium)</option>
              <option value="P4">P4 (Low)</option>
            </select>
          </div>
          
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={editedTask.status}
              onChange={(e) => setEditedTask({...editedTask, status: e.target.value as any})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          {/* Description (optional) */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-h-[100px]"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskEditModal;
