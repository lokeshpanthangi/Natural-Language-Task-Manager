
import React from 'react';
import { Task } from '../types/Task';
import TaskCard from './TaskCard';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onUpdateTask, onDeleteTask }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks found</h3>
        <p className="text-slate-600 max-w-sm mx-auto">
          Create your first task using natural language. Try something like "Review proposal for John by tomorrow 3pm"
        </p>
      </div>
    );
  }

  // Group tasks by status
  const groupedTasks = {
    pending: tasks.filter(task => task.status === 'pending'),
    'in-progress': tasks.filter(task => task.status === 'in-progress'),
    completed: tasks.filter(task => task.status === 'completed')
  };

  const getGroupIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in-progress': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getGroupColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-600 bg-amber-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-emerald-600 bg-emerald-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const formatGroupTitle = (status: string) => {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedTasks).map(([status, statusTasks]) => {
        if (statusTasks.length === 0) return null;
        
        return (
          <div key={status} className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getGroupColor(status)}`}>
                {getGroupIcon(status)}
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {formatGroupTitle(status)}
              </h2>
              <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                {statusTasks.length}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statusTasks.map(task => (
                <div key={task.id} className="animate-fade-in">
                  <TaskCard 
                    task={task} 
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
