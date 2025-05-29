
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Calendar, Flag } from 'lucide-react';
import { Task, ParsedTask } from '../types/Task';
import { parseNaturalLanguage } from '../utils/nlpParser';

interface TaskInputProps {
  onAddTask: (task: Task) => void;
  onCancel: () => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask, onCancel }) => {
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState<ParsedTask | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (input.trim()) {
      setIsProcessing(true);
      const timer = setTimeout(() => {
        const parsed = parseNaturalLanguage(input);
        setParsedData(parsed);
        setIsProcessing(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setParsedData(null);
      setIsProcessing(false);
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const parsed = parsedData || parseNaturalLanguage(input);
    const task: Task = {
      id: Date.now().toString(),
      title: parsed.title,
      assignee: parsed.assignee,
      dueDate: parsed.dueDate,
      priority: parsed.priority,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    onAddTask(task);
    setInput('');
    setParsedData(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'text-red-600 bg-red-100';
      case 'P2': return 'text-orange-600 bg-orange-100';
      case 'P3': return 'text-teal-600 bg-teal-100';
      case 'P4': return 'text-gray-600 bg-gray-100';
      default: return 'text-teal-600 bg-teal-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Create New Task</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Try: 'Finish landing page for Aman by 11pm 20th June' or 'Call client Rajeev tomorrow 5pm P1'"
            className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-all duration-200 text-lg leading-relaxed"
            rows={3}
          />
          {isProcessing && (
            <div className="absolute top-4 right-4">
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Real-time parsing preview */}
        {parsedData && (
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 animate-fade-in">
            <p className="text-sm font-medium text-slate-700 mb-3">Parsed Task Details:</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Task</p>
                  <p className="text-sm font-medium text-slate-900 truncate">{parsedData.title}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Assignee</p>
                  <p className="text-sm font-medium text-slate-900">{parsedData.assignee || 'Unassigned'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Due Date</p>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(parsedData.dueDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                  <Flag className="w-3 h-3 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Priority</p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(parsedData.priority)}`}>
                    {parsedData.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-slate-500">
            Press <kbd className="px-2 py-1 bg-slate-200 rounded text-xs">⌘ Enter</kbd> to save or <kbd className="px-2 py-1 bg-slate-200 rounded text-xs">Esc</kbd> to cancel
          </p>
          
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!input.trim()}
              className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Send className="w-4 h-4 mr-2" />
              Create Task
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskInput;
