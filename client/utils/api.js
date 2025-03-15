import axios from 'axios';
import Cookies from 'js-cookie';

const isDevelopment = process.env.NODE_ENV === 'development';

const api = axios.create({
  baseURL: isDevelopment ? '' : process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getMe = async () => {
  try {
    // In development, use the mock API route
    const response = await api.get('/api/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get Me API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

export const getCoachingProblems = async () => {
  try {
    const response = await api.get('/coaching/problems');
    
    // Handle both possible response formats
    if (response.data?.success && response.data?.problems) {
      return response.data.problems;
    } else if (response.data?.problems) {
      return response.data.problems;
    } else if (Array.isArray(response.data)) {
      return response.data;
    }

    // Fallback data if response format is unexpected
    return [
      {
        id: "url-shortener",
        title: "Design a URL Shortener",
        difficulty: "intermediate",
        description: "Create a service that takes long URLs and creates unique short URLs, similar to TinyURL or bit.ly.",
        estimatedTime: 45
      },
      {
        id: "social-feed",
        title: "Design a Social Media Feed",
        difficulty: "advanced",
        description: "Design a news feed system that can handle millions of users posting and viewing content in real-time.",
        estimatedTime: 60
      }
    ];
  } catch (error) {
    console.error('Error fetching coaching problems:', error);
    
    if (process.env.NODE_ENV === 'development') {
      // Return mock data in development
      return [
        {
          id: "url-shortener",
          title: "Design a URL Shortener",
          difficulty: "intermediate",
          description: "Create a service that takes long URLs and creates unique short URLs, similar to TinyURL or bit.ly.",
          estimatedTime: 45
        },
        {
          id: "social-feed",
          title: "Design a Social Media Feed",
          difficulty: "advanced",
          description: "Design a news feed system that can handle millions of users posting and viewing content in real-time.",
          estimatedTime: 60
        }
      ];
    }
    
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    // Always use the Next.js API route in development
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Login API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

export const getCoachingSession = async (sessionId) => {
  if (isDevelopment) {
    try {
      // In development, try the Next.js API route first
      const mockResponse = await api.get(`/api/mock/coaching/sessions/${sessionId}`);
      return mockResponse.data.session || mockResponse.data;
    } catch (mockError) {
      console.warn('Mock API failed:', mockError);
      // Return a default mock session
      return {
        _id: sessionId,
        status: 'active',
        startedAt: new Date().toISOString(),
        problem: {
          id: 'url-shortener',
          title: 'Design a URL Shortening Service'
        },
        conversation: [{
          role: 'assistant',
          content: "Welcome to your system design coaching session! I'm here to help you work through design challenges and improve your system architecture skills. What would you like to focus on today?",
          timestamp: new Date().toISOString()
        }]
      };
    }
  }

  // If not in development or if development mock fails
  try {
    const response = await api.get(`/coaching/sessions/${sessionId}`);
    return response.data.session || response.data;
  } catch (error) {
    console.error('Error fetching coaching session:', error);
    throw error;
  }
};

export const sendCoachingMessage = async (sessionId, message, contextInfo = null) => {
  try {
    // First try the mock endpoint in development
    if (isDevelopment) {
      try {
        // Use the correct path for Next.js API routes
        const mockResponse = await api.post(`/api/mock/coaching/sessions/${sessionId}/message`, {
          message,
          contextInfo
        });
        return mockResponse.data;
      } catch (mockError) {
        console.warn('Mock API failed:', mockError);
        // Return mock data instead of falling back to real endpoint in development
        return {
          message: {
            role: 'assistant',
            content: `I understand you're asking about: "${message}". Let me help you with that. As a system design coach, I can guide you through the architectural considerations and trade-offs involved.`,
            timestamp: new Date().toISOString()
          }
        };
      }
    }

    // If not in development, use the real endpoint
    const response = await api.post(`/api/coaching/sessions/${sessionId}/message`, {
      message,
      contextInfo
    });
    return response.data;
  } catch (error) {
    console.error('Error in sendCoachingMessage:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // In development, return mock data even if real endpoint fails
    if (isDevelopment) {
      return {
        message: {
          role: 'assistant',
          content: `[Mock Response] I understand you're asking about: "${message}". Let me help you with that.`,
          timestamp: new Date().toISOString()
        }
      };
    }
    
    throw error;
  }
};

export const startCoachingSession = async (problemId) => {
  try {
    const response = await api.post('/coaching/sessions', { 
      problemId: problemId 
    });
    return response.data;
  } catch (error) {
    // If we're in development mode, use mock data
    if (process.env.NODE_ENV === 'development') {
      return {
        session: {
          _id: `mock-session-${Date.now()}`,
          problemId: problemId,
          status: 'active',
          startedAt: new Date().toISOString()
        }
      };
    }
    console.error('Error starting coaching session:', error);
    throw error;
  }
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const sendMessage = async (sessionId, message, context = {}) => {
  const response = await fetch(`${API_BASE_URL}/ai/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId, message, context }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  
  return response.json();
};

export const analyzeDiagram = async (sessionId, diagram) => {
  const response = await fetch(`${API_BASE_URL}/ai/analyze-diagram`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId, diagram }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to analyze diagram');
  }
  
  return response.json();
};

export const reviewCode = async (code, context = {}) => {
  const response = await fetch(`${API_BASE_URL}/ai/review-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, context }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to review code');
  }
  
  return response.json();
};

export default api;