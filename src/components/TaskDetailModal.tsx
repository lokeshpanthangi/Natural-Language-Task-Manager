import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Edit, Trash2, Calendar, User, Flag, Clock, CheckCircle2, 
  CalendarClock, MessageSquare, ArrowUpRight, ArrowDownRight,
  Sparkles, Brain, Zap, Target, TrendingUp, AlertTriangle
} from 'lucide-react';
import { Task } from '../types/Task';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, isPast, isToday, isTomorrow, format } from 'date-fns';

interface TaskDetailModalProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onEdit, onDelete, onClose }) => {
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  // Simulate AI insights generation
  useEffect(() => {
    const generateAIInsights = () => {
      setIsLoadingInsights(true);
      
      // Simulate API call delay
      setTimeout(() => {
        const insights = [
          `Based on the priority level (${task.priority}), this task requires ${task.priority === 'P1' ? 'immediate attention' : task.priority === 'P2' ? 'high focus' : 'moderate attention'}.`,
          `Assigned to ${task.assignee || 'no one'} - ${task.assignee ? 'ensure clear communication' : 'consider assigning to optimize workflow'}.`,
          `Due ${format(new Date(task.dueDate), 'EEEE, MMMM do')} - ${isPast(new Date(task.dueDate)) ? 'overdue, requires immediate action' : 'plan accordingly to meet deadline'}.`,
          `Current status: ${task.status} - ${task.status === 'pending' ? 'ready to begin work' : task.status === 'in-progress' ? 'actively being worked on' : 'successfully completed'}.`,
          task.description ? 'Task has detailed description - review for context and requirements.' : 'Consider adding more details to improve clarity.'
        ];
        
        setAiInsights(insights);
        setIsLoadingInsights(false);
      }, 1500);
    };

    generateAIInsights();
  }, [task]);

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'P1': return { 
        bg: 'bg-red-50', 
        text: 'text-red-700', 
        border: 'border-red-200',
        icon: <ArrowUpRight className="w-4 h-4 mr-2" />,
        label: 'Urgent',
        gradient: 'from-red-500 to-rose-500'
      };
      case 'P2': return { 
        bg: 'bg-orange-50', 
        text: 'text-orange-700', 
        border: 'border-orange-200',
        icon: <ArrowUpRight className="w-4 h-4 mr-2" />,
        label: 'High',
        gradient: 'from-orange-500 to-amber-500'
      };
      case 'P3': return { 
        bg: 'bg-blue-50', 
        text: 'text-blue-700', 
        border: 'border-blue-200',
        icon: <Flag className="w-4 h-4 mr-2" />,
        label: 'Medium',
        gradient: 'from-blue-500 to-indigo-500'
      };
      case 'P4': return { 
        bg: 'bg-green-50', 
        text: 'text-green-700', 
        border: 'border-green-200',
        icon: <ArrowDownRight className="w-4 h-4 mr-2" />,
        label: 'Low',
        gradient: 'from-green-500 to-emerald-500'
      };
      default: return { 
        bg: 'bg-slate-50', 
        text: 'text-slate-700', 
        border: 'border-slate-200',
        icon: <Flag className="w-4 h-4 mr-2" />,
        label: 'Medium',
        gradient: 'from-slate-500 to-gray-500'
      };
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'in-progress':
        return { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Clock className="w-4 h-4" /> };
      default:
        return { bg: 'bg-amber-100', text: 'text-amber-800', icon: <AlertTriangle className="w-4 h-4" /> };
    }
  };

  const isOverdue = () => {
    const dueDate = new Date(task.dueDate);
    return isPast(dueDate) && task.status !== 'completed';
  };

  const priorityStyle = getPriorityStyle(task.priority);
  const statusStyle = getStatusStyle(task.status);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          ref={modalRef}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header with Gradient */}
          <div className={`bg-gradient-to-r ${priorityStyle.gradient} p-6 text-white relative overflow-hidden`}>
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold">Task Details</h2>
                  <p className="text-white/80 text-sm">AI-Powered Insights & Analysis</p>
                </div>
              </div>
              <motion.button 
                onClick={onClose}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>
        
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Task Information */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-slate-900 flex-1 mr-4">{task.title}</h1>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${priorityStyle.bg} ${priorityStyle.text} border ${priorityStyle.border}`}>
                    {priorityStyle.icon}
                    {task.priority} - {priorityStyle.label}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                    {statusStyle.icon}
                    <span className="ml-2 capitalize">
                      {task.status === 'in-progress' ? 'In Progress' : task.status}
                    </span>
                  </span>
                </div>
              </div>
              
              {task.description && (
                <div className="bg-slate-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <MessageSquare className="w-4 h-4 text-slate-600 mr-2" />
                    <span className="text-sm font-medium text-slate-700">Description</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{task.description}</p>
                </div>
              )}
              
              {/* Task Meta Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Assignee</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{task.assignee || 'Unassigned'}</p>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mr-3">
                      <CalendarClock className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Due Date</span>
                  </div>
                  <p className={`text-lg font-semibold ${
                    isOverdue() ? 'text-red-600' : 'text-slate-900'
                  }`}>
                    {format(new Date(task.dueDate), 'EEEE, MMMM do, yyyy')}
                  </p>
                  <p className="text-sm text-slate-600">
                    {format(new Date(task.dueDate), 'h:mm a')}
                    {isOverdue() && ' (Overdue)'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* AI Insights Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <motion.div 
                  className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mr-3"
                  animate={{ rotate: isLoadingInsights ? 360 : 0 }}
                  transition={{ duration: 2, repeat: isLoadingInsights ? Infinity : 0, ease: "linear" }}
                >
                  <Brain className="w-4 h-4 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold text-slate-900">AI Insights</h3>
                <motion.div 
                  className="ml-2 flex items-center"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                </motion.div>
              </div>
              
              <div className="space-y-3">
                {isLoadingInsights ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <motion.div 
                        key={i}
                        className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg p-4 h-16"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                ) : (
                  aiInsights.map((insight, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100"
                    >
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          <Target className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-slate-700 leading-relaxed">{insight}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200">
              <motion.button
                onClick={onDelete}
                className="inline-flex items-center px-4 py-2.5 border border-red-300 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Task
              </motion.button>
              
              <motion.button
                onClick={onEdit}
                className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Task
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskDetailModal;