import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Save, Calendar, User, Flag, Clock, AlertCircle, CheckCircle2, 
  CalendarClock, MessageSquare, ArrowUpRight, ArrowDownRight, Edit, Trash2
} from 'lucide-react';
import { Task } from '../types/Task';
import { motion, AnimatePresence } from 'framer-motion';

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
    onCancel(); // Add this line to close the modal after saving
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return {
        bg: 'bg-red-100', 
        text: 'text-red-700',
        border: 'border-red-300',
        icon: <ArrowUpRight className="w-3.5 h-3.5 mr-1" />,
        label: 'Urgent',
        gradient: 'from-red-500 to-rose-500'
      };
      case 'P2': return {
        bg: 'bg-orange-100', 
        text: 'text-orange-700',
        border: 'border-orange-300',
        icon: <ArrowUpRight className="w-3.5 h-3.5 mr-1" />,
        label: 'High',
        gradient: 'from-orange-500 to-amber-500'
      };
      case 'P3': return {
        bg: 'bg-blue-100', 
        text: 'text-blue-700',
        border: 'border-blue-300',
        icon: <Flag className="w-3.5 h-3.5 mr-1" />,
        label: 'Medium',
        gradient: 'from-blue-500 to-indigo-500'
      };
      case 'P4': return {
        bg: 'bg-green-100', 
        text: 'text-green-700',
        border: 'border-green-300',
        icon: <ArrowDownRight className="w-3.5 h-3.5 mr-1" />,
        label: 'Low',
        gradient: 'from-green-500 to-emerald-500'
      };
      default: return {
        bg: 'bg-blue-100', 
        text: 'text-blue-700',
        border: 'border-blue-300',
        icon: <Flag className="w-3.5 h-3.5 mr-1" />,
        label: 'Medium',
        gradient: 'from-blue-500 to-indigo-500'
      };
    }
  };
  
  // Create a ref for the modal content
  const modalRef = useRef<HTMLDivElement>(null);
  const priorityStyle = getPriorityColor(editedTask.priority);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCancel]);

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div 
          ref={modalRef}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Edit className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold">Edit Task</h2>
              </div>
              <motion.button 
                onClick={onCancel}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>
        
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="mb-5">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                    <MessageSquare className="w-3.5 h-3.5 text-white" />
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter task title"
                  required
                />
              </div>
          
              {/* Assignee */}
              <div className="mb-5">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
                    <User className="w-3.5 h-3.5 text-white" />
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
          
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                {/* Due Date */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
                      <CalendarClock className="w-3.5 h-3.5 text-white" />
                    </div>
                    <label htmlFor="dueDate" className="text-sm font-medium text-slate-700">
                      Due Date
                    </label>
                  </div>
                  <input
                    id="dueDate"
                    type="datetime-local"
                    value={new Date(editedTask.dueDate).toISOString().slice(0, 16)}
                    onChange={(e) => setEditedTask({...editedTask, dueDate: new Date(e.target.value).toISOString()})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
                {/* Priority */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                      <Flag className="w-3.5 h-3.5 text-white" />
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
              </div>
            
                {/* Status */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-white" />
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
              {/* Description (optional) */}
              <div className="mb-5">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-slate-500 to-gray-500 flex items-center justify-center shadow-sm">
                    <MessageSquare className="w-3.5 h-3.5 text-white" />
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
              <div className="mb-5 p-4 bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-700 mb-3">Task Preview:</p>
                <div className="flex flex-col items-center space-y-3">
                  <motion.span 
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${priorityStyle.bg} ${priorityStyle.text} border ${priorityStyle.border} shadow-sm`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {priorityStyle.icon}
                    {editedTask.priority} - {priorityStyle.label}
                  </motion.span>
                  
                  <div className="text-center mt-2">
                    <p className="text-xs text-slate-500">Status</p>
                    <p className="text-sm font-medium text-slate-800 capitalize">{editedTask.status}</p>
                  </div>
                </div>
              </div>
          
              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 sticky bottom-0 bg-white pb-2">
                <motion.button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskEditModal;
