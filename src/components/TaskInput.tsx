
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Calendar, Flag, Brain, AlertCircle, Clock } from 'lucide-react';
import { Task, ParsedTask } from '../types/Task';
import { parseNaturalLanguage } from '../utils/nlpParser';
import { OpenAIService, getApiKey } from '../utils/openaiService';


interface TaskInputProps {
  onAddTask: (task: Task) => void;
  onCancel: () => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask, onCancel }) => {
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState<ParsedTask | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (input.trim()) {
      setIsProcessing(true);
      setAiError(null);
      
      const timer = setTimeout(async () => {
        try {
          if (useAI) {
            // Try OpenAI parsing first
            const openaiService = new OpenAIService();
            const aiParsed = await openaiService.parseTaskWithAI(input);
            setParsedData(aiParsed);
          } else {
            // Fallback to local NLP parsing
            const parsed = parseNaturalLanguage(input);
            setParsedData(parsed);
          }
        } catch (error) {
          console.error('AI parsing failed, falling back to local parsing:', error);
          setAiError(error instanceof Error ? error.message : 'AI parsing failed');
          // Fallback to local parsing
          const parsed = parseNaturalLanguage(input);
          setParsedData(parsed);
        } finally {
          setIsProcessing(false);
        }
      }, 500); // Slightly longer delay for AI processing
      
      return () => clearTimeout(timer);
    } else {
      setParsedData(null);
      setIsProcessing(false);
      setAiError(null);
    }
  }, [input, useAI]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const parsed = parsedData || parseNaturalLanguage(input);
    
    // Preserve the exact time from the parsed data in IST timezone
    // Only adjust if the date is in the past
    let dueDate = new Date(parsed.dueDate);
    const now = new Date();
    
    // If the date is in the past, add a year but preserve the exact time
    if (dueDate < now) {
      // Extract time components (in IST)
      const hours = dueDate.getHours();
      const minutes = dueDate.getMinutes();
      const seconds = dueDate.getSeconds();
      
      // Add a year
      dueDate.setFullYear(dueDate.getFullYear() + 1);
      
      // Restore the exact time components (in IST)
      dueDate.setHours(hours, minutes, seconds, 0);
    }
    
    // Ensure we're keeping the exact time as specified by the user
    // This is critical for IST timezone handling
    
    const task: Task = {
      id: Date.now().toString(),
      title: parsed.title,
      assignee: parsed.assignee,
      dueDate: dueDate.toISOString(), // Use the corrected date with preserved time
      priority: parsed.priority,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    onAddTask(task);
    setInput('');
    setParsedData(null);
    setAiError(null);
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
    <div className="space-y-4">


      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              {useAI ? <Brain className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Create New Task</h3>
          </div>

          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Use AI</span>
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Try: 'Write a comprehensive project proposal for the new mobile app, assign to Sarah, make it P1 priority due next Friday 2pm'"
              className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-all duration-200 text-lg leading-relaxed"
              rows={3}
            />
            {isProcessing && (
              <div className="absolute top-4 right-4">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {useAI && !isProcessing && (
              <div className="absolute top-4 right-4">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Brain className="w-3 h-3 text-emerald-600" />
                </div>
              </div>
            )}
          </div>

          {/* AI Error Display */}
          {aiError && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-800">AI parsing failed, using local parsing</p>
                <p className="text-xs text-amber-600">{aiError}</p>
              </div>
            </div>
          )}

          {/* Real-time parsing preview */}
          {parsedData && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-700">🔍 Extracted Task Details:</p>
                {useAI && !aiError && (
                  <div className="flex items-center space-x-1 text-xs text-emerald-600">
                    <Brain className="w-3 h-3" />
                    <span>AI Enhanced</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Task:</p>
                    <p className="text-sm font-medium text-slate-900">{parsedData.title}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                    <User className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Assignee:</p>
                    <p className="text-sm font-medium text-slate-900">{parsedData.assignee || 'Unassigned'}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <Calendar className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Due Date:</p>
                    <p className="text-sm font-medium text-slate-900">
                      {parsedData.dueDateFormatted || new Date(parsedData.dueDate).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                {/* Only show time if it was explicitly specified */}
                {parsedData.timeSpecified === true && parsedData.dueTimeFormatted && (
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-0.5">
                      <Clock className="w-3 h-3 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Due Time:</p>
                      <p className="text-sm font-medium text-slate-900">
                        {parsedData.dueTimeFormatted}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
                    <Flag className="w-3 h-3 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Priority:</p>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(parsedData.priority)}`}>
                        {parsedData.priorityText || parsedData.priority}
                      </span>
                      {parsedData.priorityReason && (
                        <span className="text-xs text-slate-500 italic">
                          ({parsedData.priorityReason})
                        </span>
                      )}
                    </div>
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
    </div>
  );
};

export default TaskInput;
