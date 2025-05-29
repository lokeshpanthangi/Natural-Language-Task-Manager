
import React, { useState } from 'react';
import { Key, Eye, EyeOff, Check, X } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySet: (key: string) => void;
  currentKey?: string;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet, currentKey }) => {
  const [apiKey, setApiKey] = useState(currentKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isEditing, setIsEditing] = useState(!currentKey);

  const handleSave = () => {
    if (apiKey.trim()) {
      onApiKeySet(apiKey.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setApiKey(currentKey || '');
    setIsEditing(false);
  };

  if (!isEditing && currentKey) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Key className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-900">OpenAI API Key Configured</p>
              <p className="text-xs text-emerald-600">AI-powered task parsing is enabled</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Key className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-blue-900">Configure OpenAI API Key</p>
          <p className="text-xs text-blue-600">Enable AI-powered task parsing and enhancement</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full pr-10 pl-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-3 h-3 mr-1" />
            Save
          </button>
          {currentKey && (
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-3 py-1.5 text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </button>
          )}
        </div>
        
        <p className="text-xs text-blue-600">
          Your API key is stored locally in your browser and never sent to our servers.
          For production use, consider using Supabase for secure key management.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyInput;
