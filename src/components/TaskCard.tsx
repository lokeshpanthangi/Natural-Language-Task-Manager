import React, { useState } from 'react';
import { Task } from '../types/Task';
import { formatDistanceToNow, isPast, isToday, isTomorrow, format } from 'date-fns';
import { 
  CheckCircle2, Clock, Calendar, User, Flag, Trash2, Edit, 
  AlertCircle, CalendarClock, ArrowUpRight, ArrowDownRight, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskEditModal from './TaskEditModal';
import TaskDetailModal from './TaskDetailModal';

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const getPriorityStyle = (priority: string) => {
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
        bg: 'bg-slate-100', 
        text: 'text-slate-700', 
        border: 'border-slate-300',
        icon: <Flag className="w-3.5 h-3.5 mr-1" />,
        label: 'Medium',
        gradient: 'from-slate-500 to-gray-500'
      };
    }
  };

  const isOverdue = () => {
    const dueDate = new Date(task.dueDate);
    return isPast(dueDate) && task.status !== 'completed';
  };
  
  const getDateLabel = () => {
    const dueDate = new Date(task.dueDate);
    if (isToday(dueDate)) {
      return 'Today';
    } else if (isTomorrow(dueDate)) {
      return 'Tomorrow';
    } else if (isPast(dueDate)) {
      return `Overdue by ${formatDistanceToNow(dueDate)}`;
    } else {
      return format(dueDate, 'MMM d');
    }
  };
  
  const getTimeLabel = () => {
    return format(new Date(task.dueDate), 'h:mm a');
  };

  const priorityStyle = getPriorityStyle(task.priority);
  
  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => setShowDetail(true)}
        className={`bg-white rounded-xl shadow-sm border-l-4 transition-all duration-300 hover:shadow-xl h-[280px] w-full relative overflow-hidden cursor-pointer ${
          task.status === 'completed' ? `border-emerald-400 bg-emerald-50/30` : 
          isOverdue() ? `border-red-400 bg-red-50/30` : `border-${priorityStyle.border.split('-')[1]}-400`
        }`}
      >
        <div className="p-5 relative">
          {/* Background Decoration - Only visible on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.07 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${priorityStyle.gradient} blur-2xl -mr-10 -mt-10 z-0`}
              />
            )}
          </AnimatePresence>
          
          {/* Priority Badge */}
          <div className="absolute top-0 right-0 mt-2 mr-2">
            <motion.span 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${priorityStyle.bg} ${priorityStyle.text}`}
            >
              {priorityStyle.icon}
              {task.priority} - {priorityStyle.label}
            </motion.span>
          </div>

          {/* Task Title */}
          <motion.h3 
            className={`text-lg font-semibold mb-4 mt-6 relative z-10 line-clamp-2 ${
              task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'
            }`}
            animate={{
              textDecoration: task.status === 'completed' ? 'line-through' : 'none',
            }}
            transition={{ duration: 0.3 }}
            title={task.title} // Show full title on hover
          >
            {task.title}
            {task.status === 'completed' && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="ml-2 inline-flex items-center text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shadow-sm"
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </motion.span>
            )}
          </motion.h3>
          
          {/* Task Meta */}
          <div className="space-y-3 mb-4">
            {/* Assignee */}
            <div className="flex items-center text-sm text-slate-600">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-2 shadow-sm">
                <User className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <span className="font-medium">{task.assignee || 'Unassigned'}</span>
            </div>
            
            {/* Due Date */}
            <div className="flex items-center text-sm text-slate-600">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mr-2 shadow-sm">
                <CalendarClock className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="flex flex-col">
                <span className={isOverdue() ? 'text-red-600 font-medium' : 'font-medium'}>
                  {getDateLabel()}
                </span>
                <span className="text-xs text-slate-500">{getTimeLabel()}</span>
              </div>
            </div>
            
            {/* Status */}
            <div className="flex items-center text-sm">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className={
                `font-medium ${
                  task.status === 'completed' ? 'text-emerald-600' : 
                  task.status === 'in-progress' ? 'text-blue-600' : 'text-amber-600'
                }`
              }>
                {task.status === 'in-progress' ? 'In Progress' : 
                 task.status === 'completed' ? 'Completed' : 'Pending'}
              </span>
            </div>
          </div>

          {/* Description Preview */}
          {task.description && (
            <div className="text-sm text-slate-600 line-clamp-2 mb-4 relative z-10">
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center mr-2 shadow-sm">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <p className="line-clamp-2">{task.description}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute bottom-0 right-0 p-4 flex space-x-2">
            {/* Edit Button */}
            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all"
            >
              <Edit className="w-4 h-4" />
            </motion.button>
            
            {/* Delete Button */}
            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
      
      {/* Task Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <TaskEditModal
            task={task}
            onSave={onUpdate}
            onCancel={() => setIsEditing(false)}
          />
        )}
      </AnimatePresence>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {showDetail && (
          <TaskDetailModal
            task={task}
            onEdit={() => {
              setShowDetail(false);
              setIsEditing(true);
            }}
            onDelete={() => {
              setShowDetail(false);
              onDelete(task.id);
            }}
            onClose={() => setShowDetail(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TaskCard;
