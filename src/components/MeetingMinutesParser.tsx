import React, { useState } from 'react';
import { Sparkles, Send, AlertCircle, Loader2, Info, CheckCircle2 } from 'lucide-react';
import { Task, ParsedTask } from '../types/Task';
import { parseMultipleTasks } from '../utils/meetingMinutesParser';
import { OpenAIService } from '../utils/openaiService';
import { motion, AnimatePresence } from 'framer-motion';

interface MeetingMinutesParserProps {
  onAddTasks: (tasks: Task[]) => void;
  onCancel: () => void;
}

// Extended ParsedTask interface to include context from GPT-4
interface EnhancedParsedTask extends ParsedTask {
  context?: string;
}

const MeetingMinutesParser: React.FC<MeetingMinutesParserProps> = ({ onAddTasks, onCancel }) => {
  const [transcript, setTranscript] = useState('');
  const [parsedTasks, setParsedTasks] = useState<EnhancedParsedTask[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showParsedTasks, setShowParsedTasks] = useState(false);
  const [parsingMethod, setParsingMethod] = useState<'gpt4' | 'local'>('gpt4');
  const [parsingSuccess, setParsingSuccess] = useState(false);
  
  const handleTranscriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscript(e.target.value);
    // Reset parsed tasks when transcript changes
    setParsedTasks([]);
    setShowParsedTasks(false);
    setParsingSuccess(false);
  };
  
  const handleParse = async () => {
    if (!transcript.trim()) return;
    
    setIsProcessing(true);
    setAiError(null);
    setParsingSuccess(false);
    
    try {
      if (useAI) {
        // Use OpenAI GPT-4 to parse meeting minutes
        const openaiService = new OpenAIService();
        try {
          // First try with GPT-4 for best results
          const aiParsed = await openaiService.parseMultipleTasksWithAI(transcript);
          setParsedTasks(aiParsed as EnhancedParsedTask[]);
          setParsingMethod('gpt4');
          setParsingSuccess(true);
        } catch (gpt4Error) {
          console.warn('GPT-4 parsing failed, falling back to local parser:', gpt4Error);
          // Fallback to local parsing
          const parsed = parseMultipleTasks(transcript);
          setParsedTasks(parsed as EnhancedParsedTask[]);
          setParsingMethod('local');
          // Set a warning but don't treat as error since we have a fallback
          setAiError('GPT-4 parsing unavailable. Using local parser instead.');
        }
      } else {
        // Use local parser as fallback
        const parsed = parseMultipleTasks(transcript);
        setParsedTasks(parsed as EnhancedParsedTask[]);
        setParsingMethod('local');
      }
      setShowParsedTasks(true);
    } catch (error) {
      console.error('All parsing methods failed:', error);
      setAiError(error instanceof Error ? error.message : 'Parsing failed');
      
      // Create an empty array if all parsing methods fail
      setParsedTasks([]);
      setShowParsedTasks(true);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleAddAllTasks = () => {
    if (parsedTasks.length === 0) return;
    
    const now = new Date();
    const tasks: Task[] = parsedTasks.map(parsedTask => {
      // Ensure the dueDate is valid and in the future
      let dueDate = new Date(parsedTask.dueDate);
      
      // If the date is invalid, set it to tomorrow
      if (isNaN(dueDate.getTime())) {
        dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 1);
      }
      
      // Create description with context if available
      const description = parsedTask.context 
        ? `${parsedTask.title}\n\nContext: ${parsedTask.context}` 
        : parsedTask.title;
      
      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        title: description,
        assignee: parsedTask.assignee,
        dueDate: dueDate.toISOString(),
        priority: parsedTask.priority,
        status: 'pending',
        createdAt: now.toISOString()
      };
    });
    
    onAddTasks(tasks);
    setTranscript('');
    setParsedTasks([]);
    setShowParsedTasks(false);
    setParsingSuccess(false);
  };
  
  const handleRemoveTask = (index: number) => {
    setParsedTasks(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleUpdateTask = (index: number, updatedTask: EnhancedParsedTask) => {
    setParsedTasks(prev => prev.map((task, i) => i === index ? updatedTask : task));
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'text-red-600 bg-red-100';
      case 'P2': return 'text-orange-600 bg-orange-100';
      case 'P3': return 'text-blue-600 bg-blue-100';
      case 'P4': return 'text-green-600 bg-green-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };
  
  return (
    <div className="space-y-4">
      <motion.div 
        className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">AI Meeting Minutes Parser</h2>
          </div>
          
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <span className="mr-2 text-sm text-slate-600">Use AI</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={useAI}
                  onChange={() => setUseAI(!useAI)}
                />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-teal-500"></div>
              </div>
            </label>
          </div>
        </div>
        
        {parsingSuccess && (
          <motion.div 
            className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start space-x-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-800">Tasks Extracted Successfully</p>
              <p className="text-xs text-emerald-600">Using {parsingMethod === 'gpt4' ? 'GPT-4 AI' : 'Local Parser'} to analyze your meeting minutes.</p>
            </div>
          </motion.div>
        )}
        
        {aiError && (
          <motion.div 
            className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <Info className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">AI Processing Note</p>
              <p className="text-xs text-amber-600">{aiError}</p>
              {parsingMethod === 'local' && (
                <p className="text-xs text-slate-600 mt-1">Using local parsing instead.</p>
              )}
            </div>
          </motion.div>
        )}
        
        <form onSubmit={(e) => { e.preventDefault(); handleParse(); }}>
          <div className="mb-4">
            <textarea
              value={transcript}
              onChange={handleTranscriptChange}
              placeholder="Paste your meeting transcript here... For example: 'Aman you take the landing page by 10pm tomorrow. Rajeev you take care of client follow-up by Wednesday. Shreya please review the marketing deck tonight.'"
              className="w-full min-h-[200px] p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-y text-slate-700"
              disabled={isProcessing}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              <p>Paste meeting minutes to automatically extract tasks, assignees, and deadlines.</p>
              {useAI && (
                <p className="text-xs mt-1 text-indigo-600">Using GPT-4 to intelligently extract tasks from conversational text.</p>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={!transcript.trim() || isProcessing}
                className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Parse Meeting Minutes
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
      
      {/* Parsed Tasks Preview */}
      <AnimatePresence>
        {showParsedTasks && (
          <motion.div 
            className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Extracted Tasks ({parsedTasks.length})
              </h3>
              
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={handleAddAllTasks}
                  disabled={parsedTasks.length === 0}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Send className="w-3 h-3 mr-2" />
                  Add All Tasks
                </motion.button>
              </div>
            </div>
            
            {parsedTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">No tasks could be extracted from the transcript.</p>
                <p className="text-sm text-slate-400 mt-2">Try adding more context or specific task assignments.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {parsedTasks.map((task, index) => (
                  <motion.div 
                    key={index} 
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-grow">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={task.title}
                            onChange={(e) => handleUpdateTask(index, { ...task, title: e.target.value })}
                            className="text-slate-900 font-medium w-full border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none px-1 py-0.5"
                          />
                        </div>
                        
                        {/* Task Context (if available) */}
                        {task.context && (
                          <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
                            <p className="text-xs text-slate-500 mb-1">Additional Context:</p>
                            <p className="text-sm text-slate-700">{task.context}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs text-slate-500">Assignee:</p>
                            <input
                              type="text"
                              value={task.assignee}
                              onChange={(e) => handleUpdateTask(index, { ...task, assignee: e.target.value })}
                              className="text-sm text-slate-700 w-full border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none px-1 py-0.5"
                              placeholder="Unassigned"
                            />
                          </div>
                          
                          <div>
                            <p className="text-xs text-slate-500">Due Date:</p>
                            <input
                              type="datetime-local"
                              value={new Date(task.dueDate).toISOString().slice(0, 16)}
                              onChange={(e) => {
                                const date = new Date(e.target.value);
                                handleUpdateTask(index, { 
                                  ...task, 
                                  dueDate: date.toISOString(),
                                  dueDateFormatted: date.toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                });
                              }}
                              className="text-sm text-slate-700 w-full border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none px-1 py-0.5"
                            />
                          </div>
                          
                          <div>
                            <p className="text-xs text-slate-500">Priority:</p>
                            <select
                              value={task.priority}
                              onChange={(e) => handleUpdateTask(index, { ...task, priority: e.target.value as any })}
                              className="text-sm w-full border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none px-1 py-0.5 bg-transparent"
                            >
                              <option value="P1">P1 (Urgent)</option>
                              <option value="P2">P2 (High)</option>
                              <option value="P3">P3 (Medium)</option>
                              <option value="P4">P4 (Low)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <motion.button
                          onClick={() => handleRemoveTask(index)}
                          className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center hover:border-red-500 hover:bg-red-50 transition-all duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeetingMinutesParser;
