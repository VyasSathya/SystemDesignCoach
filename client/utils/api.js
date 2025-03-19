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
  try {
    const response = await api.get(`/api/mock/coaching/sessions/${sessionId}`);
    // Return the response data directly since the API now returns the correct structure
    return response.data;
  } catch (error) {
    console.error('Error fetching coaching session:', {
      sessionId,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Return a fallback session if the API fails
    return {
      _id: sessionId,
      status: 'active',
      startedAt: new Date().toISOString(),
      problem: {
        id: 'url-shortener',
        title: 'System Design Coaching Session',
        description: 'Practice your system design skills.',
        difficulty: 'intermediate',
        estimatedTime: 45
      },
      conversation: [{
        id: 0,
        role: 'assistant',
        content: "Welcome to your system design coaching session! Let's begin our journey!",
        timestamp: new Date().toISOString()
      }]
    };
  }
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const sendCoachingMessage = async (sessionId, message, contextInfo = null) => {
  if (!sessionId) {
    console.error('Missing sessionId');
    throw new Error('Session ID is required');
  }

  try {
    console.log('Sending coaching message:', {
      sessionId,
      messageLength: message.length,
      hasContextInfo: !!contextInfo
    });

    const response = await fetch(`/api/mock/coaching/sessions/${sessionId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        contextInfo,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(errorData.error || errorData.details || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.message) {
      console.warn('Missing message in response data:', data);
      return {
        message: {
          role: 'assistant',
          content: 'I encountered an issue. Could you please rephrase your question?',
          timestamp: new Date().toISOString()
        }
      };
    }

    return data;
  } catch (error) {
    console.error('Error in sendCoachingMessage:', {
      error: error.message,
      sessionId,
      messageLength: message?.length
    });
    
    // If we're in development, return a fallback response
    if (process.env.NODE_ENV === 'development') {
      return {
        message: {
          role: 'assistant',
          content: 'Development mode: Unable to process message. Please check your server configuration.',
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
