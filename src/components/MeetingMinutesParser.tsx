import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Send, AlertCircle, Loader2, Info, CheckCircle2, Key, MessageSquare,
  Calendar, Clock, User, Flag, CheckSquare, XCircle, Edit2, Trash2, Save,
  ArrowUpRight, ArrowDownRight, FileText, ListTodo, CalendarClock
} from 'lucide-react';
import { Task, ParsedTask } from '../types/Task';
import { parseMultipleTasks } from '../utils/meetingMinutesParser';
import { OpenAIService, getApiKey, saveApiKey, verifyApiKey } from '../utils/openaiService';
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
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [keyVerified, setKeyVerified] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [connectionChecked, setConnectionChecked] = useState(false);
  
  // Check if API key exists and verify connection on component mount
  useEffect(() => {
    const checkApiConnection = async () => {
      const existingKey = getApiKey();
      console.log('Existing API key available:', !!existingKey);
      
      if (!existingKey) {
        setShowApiKeyInput(true);
        setConnectionChecked(true);
        return;
      }
      
      // If we have a key from env or localStorage, use it and verify
      setApiKey(existingKey);
      
      try {
        // Verify the API connection
        const isValid = await verifyApiKey(existingKey);
        setKeyVerified(isValid);
        setApiConnected(isValid);
        if (!isValid) {
          setShowApiKeyInput(true);
          setAiError('API key validation failed. Please check your key.');
        }
      } catch (error) {
        console.error('API connection check failed:', error);
        setAiError('Could not verify API connection. Will try again when parsing.');
      } finally {
        setConnectionChecked(true);
      }
    };
    
    checkApiConnection();
  }, []);
  
  const handleTranscriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscript(e.target.value);
    // Reset parsed tasks when transcript changes
    setParsedTasks([]);
    setShowParsedTasks(false);
    setParsingSuccess(false);
  };
  
  const handleVerifyApiKey = async () => {
    if (!apiKey.trim()) {
      setAiError('Please enter a valid API key');
      return;
    }
    
    setIsVerifyingKey(true);
    setAiError(null);
    
    try {
      const isValid = await verifyApiKey(apiKey);
      
      if (isValid) {
        // Save the API key for future use
        saveApiKey(apiKey);
        setKeyVerified(true);
        setApiConnected(true);
        setShowApiKeyInput(false);
        setAiError(null);
      } else {
        setAiError('Invalid API key. Please check and try again.');
      }
    } catch (error) {
      setAiError('Failed to verify API key. Please try again.');
      console.error('API key verification error:', error);
    } finally {
      setIsVerifyingKey(false);
    }
  };
  
  const handleParse = async () => {
    if (!transcript.trim()) return;
    
    // If API key is required but not provided, show the input
    if (useAI && !getApiKey() && !keyVerified) {
      setShowApiKeyInput(true);
      return;
    }
    
    setIsProcessing(true);
    setAiError(null);
    setParsedTasks([]);
    setShowParsedTasks(false);
    setParsingSuccess(false);
    
    try {
      let parsedResults: EnhancedParsedTask[] = [];
      
      if (useAI) {
        // Try to use OpenAI API first if enabled
        try {
          console.log('Using OpenAI API for parsing');
          const apiKey = getApiKey();
          
          if (!apiKey) {
            throw new Error('API key is required for AI parsing');
          }
          
          const openaiService = new OpenAIService(apiKey);
          const aiParsedTasks = await openaiService.extractTasksFromText(transcript);
          
          if (aiParsedTasks && aiParsedTasks.length > 0) {
            parsedResults = aiParsedTasks;
            setParsingMethod('gpt4');
            setApiConnected(true);
          } else {
            throw new Error('No tasks were extracted by the AI');
          }
        } catch (error) {
          console.error('OpenAI API error:', error);
          setAiError(`AI parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}. Falling back to local parsing.`);
          
          // Fallback to local parsing
          parsedResults = parseMultipleTasks(transcript);
          setParsingMethod('local');
        }
      } else {
        // Use local parsing directly if AI is disabled
        console.log('Using local parsing');
        parsedResults = parseMultipleTasks(transcript);
        setParsingMethod('local');
      }
      
      if (parsedResults.length > 0) {
        setParsedTasks(parsedResults);
        setShowParsedTasks(true);
        setParsingSuccess(true);
      } else {
        setAiError('No tasks could be extracted from the provided text. Please try with more specific task descriptions.');
      }
    } catch (error) {
      console.error('Parsing error:', error);
      setAiError(`Failed to parse tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleAddAllTasks = () => {
    if (parsedTasks.length === 0) return;
    
    const now = new Date();
    const tasks: Task[] = parsedTasks.map((parsedTask, index) => {
      // Create description with context if available
      const description = parsedTask.context 
        ? `${parsedTask.title}\n\nContext: ${parsedTask.context}` 
        : parsedTask.title;

      return {
        id: `task-${Date.now()}-${index}`,
        title: parsedTask.title,
        description,
        assignee: parsedTask.assignee,
        dueDate: parsedTask.dueDate,
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
      case 'P1': return {
        bg: 'bg-red-100 hover:bg-red-200', 
        text: 'text-red-700',
        border: 'border-red-300',
        icon: <ArrowUpRight className="w-3.5 h-3.5 mr-1" />,
        label: 'Urgent'
      };
      case 'P2': return {
        bg: 'bg-orange-100 hover:bg-orange-200', 
        text: 'text-orange-700',
        border: 'border-orange-300',
        icon: <ArrowUpRight className="w-3.5 h-3.5 mr-1" />,
        label: 'High'
      };
      case 'P3': return {
        bg: 'bg-blue-100 hover:bg-blue-200', 
        text: 'text-blue-700',
        border: 'border-blue-300',
        icon: <Flag className="w-3.5 h-3.5 mr-1" />,
        label: 'Medium'
      };
      case 'P4': return {
        bg: 'bg-green-100 hover:bg-green-200', 
        text: 'text-green-700',
        border: 'border-green-300',
        icon: <ArrowDownRight className="w-3.5 h-3.5 mr-1" />,
        label: 'Low'
      };
      default: return {
        bg: 'bg-blue-100 hover:bg-blue-200', 
        text: 'text-blue-700',
        border: 'border-blue-300',
        icon: <Flag className="w-3.5 h-3.5 mr-1" />,
        label: 'Medium'
      };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-purple-500" />
          Meeting Minutes Parser
        </h2>

        {connectionChecked && (
          <div className="flex items-center">
            <span className="text-sm mr-2">
              API Status:
            </span>
            {apiConnected ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <AlertCircle className="w-3 h-3 mr-1" />
                Disconnected
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* API Key Input */}
      {showApiKeyInput && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
        >
          <h3 className="text-md font-medium mb-2 text-blue-700 flex items-center">
            <Key className="w-4 h-4 mr-2" />
            OpenAI API Key Required
          </h3>
          <p className="text-sm text-blue-600 mb-3">
            To extract tasks from meeting minutes using AI, please enter your OpenAI API key.
            This key will be stored locally in your browser and never sent to our servers.
          </p>
          
          <div className="flex items-center space-x-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
              className="flex-grow px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            <button
              onClick={handleVerifyApiKey}
              disabled={isVerifyingKey || !apiKey.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isVerifyingKey ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Verify Key
                </>
              )}
            </button>
          </div>
          
          {aiError && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {aiError}
            </p>
          )}
          
          <div className="mt-3 text-xs text-blue-500 flex items-center">
            <Info className="w-3 h-3 mr-1" />
            Don't have an API key? You can still use the basic parser without AI.
            <button 
              onClick={() => {
                setShowApiKeyInput(false);
                setUseAI(false);
              }}
              className="ml-2 underline text-blue-600 hover:text-blue-800"
            >
              Use without AI
            </button>
          </div>
        </motion.div>
      )}
      
      <motion.div 
        className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-4">
          <label htmlFor="transcript" className="block text-sm font-medium text-slate-700 mb-1">
            Paste your meeting minutes or conversation transcript:
          </label>
          <textarea
            id="transcript"
            value={transcript}
            onChange={handleTranscriptChange}
            rows={8}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Paste your meeting transcript here... The AI will extract tasks, assignees, due dates, and priorities."
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            
            <motion.button
              onClick={handleParse}
              disabled={isProcessing || !transcript.trim()}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {useAI ? (
                    <Sparkles className="w-4 h-4 mr-2" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  {useAI ? 'Extract Tasks with AI' : 'Extract Tasks'}
                </>
              )}
            </motion.button>
          </div>
          
          <div className="flex items-center">
            <label htmlFor="use-ai" className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  id="use-ai"
                  type="checkbox"
                  className="sr-only"
                  checked={useAI}
                  onChange={() => {
                    setUseAI(!useAI);
                    if (!useAI) {
                      // If turning AI back on, check if we need to show API key input
                      const hasKey = !!getApiKey();
                      setShowApiKeyInput(!hasKey);
                    } else {
                      setShowApiKeyInput(false);
                    }
                  }}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ${useAI ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${useAI ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <div className="ml-3 text-sm font-medium text-slate-700">Use AI (GPT-4)</div>
            </label>
          </div>
        </div>
        
        {aiError && !showApiKeyInput && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {aiError}
            </p>
          </div>
        )}
      </motion.div>
      
      {/* Parsed Tasks Preview */}
      <AnimatePresence>
        {showParsedTasks && (
          <motion.div 
            className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-lg border border-slate-200 p-6 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-md mr-3">
                  <ListTodo className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center">
                    Extracted Tasks 
                    <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
                      {parsedTasks.length}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {parsingMethod === 'gpt4' ? 'Extracted using AI' : 'Extracted using local parser'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={handleAddAllTasks}
                  disabled={parsedTasks.length === 0}
                  className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Add All Tasks
                </motion.button>
              </div>
            </div>
            
            {parsedTasks.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">No tasks could be extracted from the transcript.</p>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">Try adding more context or specific task assignments with clear deadlines and assignees.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {parsedTasks.map((task, index) => {
                  const priorityStyle = getPriorityColor(task.priority);
                  return (
                    <motion.div 
                      key={index} 
                      className={`border ${priorityStyle.border} rounded-xl p-5 hover:shadow-lg transition-all duration-300 bg-white`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      whileHover={{ y: -2 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-4 flex-grow">
                          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                            <CheckSquare className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                            <input
                              type="text"
                              value={task.title}
                              onChange={(e) => handleUpdateTask(index, { ...task, title: e.target.value })}
                              className="text-slate-800 font-medium w-full border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none px-1 py-1 text-base"
                            />
                          </div>
                          
                          {/* Task Context (if available) */}
                          {task.context && (
                            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                              <p className="text-xs font-medium text-indigo-700 mb-1 flex items-center">
                                <Info className="w-3 h-3 mr-1" /> Additional Context:
                              </p>
                              <p className="text-sm text-indigo-900">{task.context}</p>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors duration-300">
                              <p className="text-xs font-medium text-slate-600 mb-1 flex items-center">
                                <User className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> Assignee:
                              </p>
                              <div className="flex items-center">
                                <input
                                  type="text"
                                  value={task.assignee}
                                  onChange={(e) => handleUpdateTask(index, { ...task, assignee: e.target.value })}
                                  className="text-sm text-slate-800 w-full border-b border-transparent hover:border-indigo-300 focus:border-indigo-500 focus:outline-none px-1 py-1 bg-transparent"
                                  placeholder="Unassigned"
                                />
                                <Edit2 className="w-3.5 h-3.5 text-slate-400 ml-1" />
                              </div>
                            </div>
                            
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors duration-300">
                              <p className="text-xs font-medium text-slate-600 mb-1 flex items-center">
                                <CalendarClock className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> Due Date:
                              </p>
                              <div className="flex items-center">
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
                                  className="text-sm text-slate-800 w-full border-b border-transparent hover:border-indigo-300 focus:border-indigo-500 focus:outline-none px-1 py-1 bg-transparent"
                                />
                              </div>
                            </div>
                            
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors duration-300">
                              <p className="text-xs font-medium text-slate-600 mb-1 flex items-center">
                                <Flag className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> Priority:
                              </p>
                              <select
                                value={task.priority}
                                onChange={(e) => handleUpdateTask(index, { ...task, priority: e.target.value as any })}
                                className="text-sm w-full border-b border-transparent hover:border-indigo-300 focus:border-indigo-500 focus:outline-none px-1 py-1 bg-transparent"
                              >
                                <option value="P1">P1 (Urgent)</option>
                                <option value="P2">P2 (High)</option>
                                <option value="P3">P3 (Medium)</option>
                                <option value="P4">P4 (Low)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2 ml-4">
                          <motion.span 
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${priorityStyle.bg} ${priorityStyle.text} shadow-sm`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {priorityStyle.icon}
                            {task.priority} - {priorityStyle.label}
                          </motion.span>
                          <motion.button
                            onClick={() => handleRemoveTask(index)}
                            className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:border-red-500 hover:bg-red-50 transition-all duration-200 shadow-sm"
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-500" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeetingMinutesParser;
