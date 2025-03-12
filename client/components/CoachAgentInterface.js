// client/components/CoachAgentInterface.js
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, User, Bot } from 'lucide-react';
import { sendCoachingMessage } from '../utils/api';

// Simple client-side suggestions
const getDefaultSuggestions = (currentPage) => {
  if (currentPage === 'requirements') {
    return [
      'What user scenarios should I consider?',
      'How do I estimate scale requirements?',
      'What availability is typical for this system?'
    ];
  }
  return [
    'How can I improve my design?', 
    'What should I focus on next?',
    'What are common pitfalls with this approach?'
  ];
};

const CoachAgentInterface = ({ isOpen, onClose, currentPage, currentData }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hi! I'm your System Design Coach. What questions do you have about your design?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Build context for the coach
  const getCoachContext = () => {
    // Base context for the page
    return {
      currentPage,
      currentSection: currentPage,
      workbookContent: currentData,
      suggestions: getDefaultSuggestions(currentPage)
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Retrieve the context for building the AI prompt
    const context = getCoachContext();

    try {
      // Use a development session ID for testing
      const devSessionId = 'dev-session-1';
      // Send message to API
      const response = await sendCoachingMessage(devSessionId, input, context);
      
      if (response && response.message) {
        const coachMessage = {
          id: Date.now(),
          role: response.message.role === 'coach' ? 'assistant' : response.message.role,
          content: response.message.content,
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, coachMessage]);
      } else {
        // Fallback if API fails
        const fallbackResponse =
          'I suggest refining your service boundaries and improving inter-component communication.';
        const coachMessage = {
          id: Date.now(),
          role: 'assistant',
          content: fallbackResponse,
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, coachMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Provide user feedback on error
      const errorMessage = {
        id: Date.now(),
        role: 'assistant',
        content: "I'm experiencing some technical difficulties. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-3/4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 text-indigo-600 mr-2" />
            <h2 className="text-lg font-semibold">System Design Coach</h2>
            <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full">
              {currentPage?.charAt(0).toUpperCase() + currentPage?.slice(1) || 'General'} Mode
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-3 rounded-lg max-w-3/4 flex items-start ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="h-5 w-5 mr-2" />
                ) : (
                  <Bot className="h-5 w-5 mr-2" />
                )}
                <div>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-xs opacity-75 block mt-1">
                    {typeof msg.timestamp === 'string' 
                      ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-lg bg-gray-100 text-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 mb-1">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {getDefaultSuggestions(currentPage).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(suggestion);
                  inputRef.current.focus();
                }}
                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask the coach about your design..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachAgentInterface;