import React, { useState, useEffect } from 'react';
import { Plus, Clock, Calendar, User, Flag, Filter, Check, FileText, MessageSquare } from 'lucide-react';
import MinimalistLogo from '../components/MinimalistLogo';
import TaskInput from '../components/TaskInput';
import MeetingMinutesParser from '../components/MeetingMinutesParser';
import TaskList from '../components/TaskList';
import TaskFilters from '../components/TaskFilters';
import { Task, TaskFilters as FilterType } from '../types/Task';
import { loadTasks, saveTasks } from '../utils/storage';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [inputMode, setInputMode] = useState<'single' | 'meeting'>('single');
  const [filters, setFilters] = useState<FilterType>({
    search: '',
    priority: '',
    assignee: '',
    status: '',
    sortBy: 'dueDate'
  });
  
  const { toast } = useToast();

  useEffect(() => {
    const savedTasks = loadTasks();
    setTasks(savedTasks);
  }, []);

  const handleAddTask = (task: Task) => {
    const newTasks = [...tasks, task];
    setTasks(newTasks);
    saveTasks(newTasks);
    setShowInput(false);
    
    toast({
      title: "Task Added",
      description: `"${task.title}" has been added to your tasks.`,
      variant: "default",
    });
  };
  
  const handleAddMultipleTasks = (newTasks: Task[]) => {
    if (newTasks.length === 0) return;
    
    const updatedTasks = [...tasks, ...newTasks];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setShowInput(false);
    
    toast({
      title: "Tasks Added",
      description: `${newTasks.length} tasks have been extracted and added.`,
      variant: "default",
    });
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const newTasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  const handleDeleteTask = (taskId: string) => {
    const newTasks = tasks.filter(task => task.id !== taskId);
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !task.assignee.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.assignee && task.assignee !== filters.assignee) return false;
    if (filters.status && task.status !== filters.status) return false;
    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'dueDate':
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority':
        const priorityOrder = { 'P1': 1, 'P2': 2, 'P3': 3, 'P4': 4 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'assignee':
        return a.assignee.localeCompare(b.assignee);
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              {/* Simple minimalist logo */}
              <MinimalistLogo size={40} />
              <div>
                <h1 className="text-xl font-bold text-slate-900">TaskFlow</h1>
                <p className="text-sm text-slate-600">Natural Language Task Manager</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-slate-600">{stats.completed} Completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-slate-600">{stats.pending} Pending</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-slate-600">{stats.overdue} Overdue</span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setShowInput(!showInput);
                  if (!showInput) setInputMode('single');
                }}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 mr-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </button>
              <button
                onClick={() => {
                  setShowInput(!showInput);
                  if (!showInput) setInputMode('meeting');
                }}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Meeting Minutes
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Tasks</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-emerald-500">{stats.completed}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Overdue</p>
                <p className="text-2xl font-bold text-red-500">{stats.overdue}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Filter className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Task Input */}
        {showInput && (
          <div className="mb-8 animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
              <div className="flex space-x-1">
                <button
                  onClick={() => setInputMode('single')}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    inputMode === 'single' 
                      ? 'bg-emerald-100 text-emerald-700 font-medium' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Single Task</span>
                </button>
                <button
                  onClick={() => setInputMode('meeting')}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    inputMode === 'meeting' 
                      ? 'bg-purple-100 text-purple-700 font-medium' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Meeting Minutes</span>
                </button>
              </div>
            </div>
            
            {inputMode === 'single' ? (
              <TaskInput onAddTask={handleAddTask} onCancel={() => setShowInput(false)} />
            ) : (
              <MeetingMinutesParser onAddTasks={handleAddMultipleTasks} onCancel={() => setShowInput(false)} />
            )}
          </div>
        )}

        {/* Filters */}
        <TaskFilters filters={filters} onFiltersChange={setFilters} tasks={tasks} />

        {/* Task List */}
        <TaskList 
          tasks={filteredTasks} 
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      </div>
    </div>
  );
};

export default Index;
