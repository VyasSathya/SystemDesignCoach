import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, User, Bot } from 'lucide-react';

const CoachAgentInterface = ({ isOpen, onClose, currentPage, currentData }) => {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: 'Hi! I\'m your System Design Coach. What questions do you have about your design?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input field when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Sample coach prompts based on current page context
  const getCoachContext = () => {
    const contextByPage = {
      'requirements': {
        systemPrompt: `You are a System Design Coach helping with requirements gathering. 
        Current user data: ${JSON.stringify(currentData)}.
        Provide guidance on clarifying functional/non-functional requirements.`,
        suggestions: [
          "What user scenarios should I consider?",
          "How do I estimate my scale requirements?",
          "What availability requirements are typical for this type of system?"
        ]
      },
      'api': {
        systemPrompt: `You are a System Design Coach helping with API design.
        Current API design data: ${JSON.stringify(currentData)}.
        Provide guidance on RESTful design, parameters, and error handling.`,
        suggestions: [
          "How should I structure my API endpoints?",
          "What status codes should I use?",
          "How can I make my API more scalable?"
        ]
      },
      'data': {
        systemPrompt: `You are a System Design Coach helping with data modeling.
        Current data model: ${JSON.stringify(currentData)}.
        Provide guidance on schema design, relationships, and storage options.`,
        suggestions: [
          "Should I use SQL or NoSQL for this?",
          "How should I handle relationships between entities?",
          "What indexing strategy do you recommend?"
        ]
      },
      'architecture': {
        systemPrompt: `You are a System Design Coach helping with system architecture.
        Current architecture diagram data: ${JSON.stringify(currentData)}.
        Provide guidance on component design, interactions, and best practices.`,
        suggestions: [
          "How can I improve this architecture?",
          "What components am I missing?",
          "Is this design scalable enough?"
        ]
      },
      'scaling': {
        systemPrompt: `You are a System Design Coach helping with scaling strategies.
        Current scaling plan: ${JSON.stringify(currentData)}.
        Provide guidance on horizontal/vertical scaling, caching, and bottlenecks.`,
        suggestions: [
          "What are potential bottlenecks in my design?",
          "How can I implement caching effectively?",
          "What's the best database scaling approach?"
        ]
      },
      'reliability': {
        systemPrompt: `You are a System Design Coach helping with reliability and security.
        Current reliability and security measures: ${JSON.stringify(currentData)}.
        Provide guidance on fault tolerance, availability, security, and compliance.`,
        suggestions: [
          "What failure scenarios should I consider?",
          "How can I improve the security of my system?",
          "What are best practices for data protection?"
        ]
      }
    };

    return contextByPage[currentPage] || {
      systemPrompt: "You are a System Design Coach. Provide general guidance.",
      suggestions: ["How can I improve my design?", "What should I focus on next?"]
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);
    
    // In a real implementation, this would call your AI backend
    // For demo, simulate a response after delay
    const context = getCoachContext();
    
    setTimeout(() => {
      // Generate "thoughtful" response based on current page and question
      let response;
      
      if (input.toLowerCase().includes('bottleneck') || input.toLowerCase().includes('scale')) {
        response = "When identifying bottlenecks, focus on the components that handle the most traffic or have the strictest performance requirements. Based on your current design, I'd pay special attention to your database access patterns and consider implementing a caching layer. For scaling, remember that horizontal scaling (adding more machines) is generally more flexible than vertical scaling (adding more resources to existing machines).";
      } else if (input.toLowerCase().includes('security') || input.toLowerCase().includes('auth')) {
        response = "For authentication, JWT tokens are a good choice for stateless services. Make sure you implement proper token validation, use HTTPS everywhere, and consider rate limiting to prevent brute force attacks. You should also implement proper input validation on all endpoints to prevent injection attacks.";
      } else if (input.toLowerCase().includes('database') || input.toLowerCase().includes('data')) {
        response = "When choosing between SQL and NoSQL, consider your query patterns and consistency requirements. SQL databases are better for complex queries and strong consistency, while NoSQL databases often provide better scalability for simple read/write operations. Your current data model would work well with a relational database given the relationships between entities.";
      } else {
        response = "Looking at your current design, I'd suggest focusing on clearly defining your service boundaries and communication patterns. Consider how services will discover each other and handle failures. It's also important to think about how you'll monitor and debug the system in production. Would you like more specific guidance on any particular aspect?";
      }
      
      const coachMessage = {
        id: Date.now(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, coachMessage]);
      setLoading(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  if (!isOpen) return null;

  const context = getCoachContext();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-3/4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 text-indigo-600 mr-2" />
            <h2 className="text-lg font-semibold">System Design Coach</h2>
            <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full">
              {currentPage?.charAt(0).toUpperCase() + currentPage?.slice(1)} Mode
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`px-4 py-3 rounded-lg max-w-3/4 flex items-start ${
                  message.role === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                ) : (
                  <Bot className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-75 block mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
            {context.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
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