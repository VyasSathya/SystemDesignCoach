import axios from 'axios';
import Cookies from 'js-cookie';

const isDevelopment = process.env.NODE_ENV === 'development';

const api = axios.create({
  // Remove the /api prefix from baseURL since we'll include it in the routes
  baseURL: isDevelopment ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_API_URL,
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
    const response = await fetch('/api/coaching/problems');
    const data = await response.json();
    return data.problems || [];
  } catch (error) {
    console.error('Error fetching coaching problems:', error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    
    if (response.data?.success) {
      // Store the token in cookies
      if (response.data.token) {
        Cookies.set('auth_token', response.data.token);
      }
    }
    
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

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Coaching related API calls
export const getCoachingSession = async (id) => {
  try {
    const endpoint = process.env.NODE_ENV === 'development'
      ? `/api/mock/coaching/sessions/${id}`
      : `/api/coaching/sessions/${id}`;
      
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data) {
      throw new Error('No data received from server');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching coaching session:', error);
    throw error;
  }
};

export const getCoachingMaterials = async (id) => {
  const response = await fetch(`${API_BASE_URL}/coaching/${id}`);
  return response.json();
};

export const sendCoachingMessage = async (sessionId, message) => {
  const response = await fetch(`${API_BASE_URL}/coaching/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId, message }),
  });
  return response.json();
};

export const saveDiagram = async (sessionId, type, data) => {
  const response = await fetch(`${API_BASE_URL}/coaching/sessions/${sessionId}/diagram`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, data }),
  });
  return response.json();
};

export const getCoachingDiagram = async (id) => {
  const response = await fetch(`${API_BASE_URL}/coaching/sessions/${id}/diagram`);
  return response.json();
};

export const startCoachingSession = async (problemId) => {
  try {
    // Use mock API in development
    const endpoint = process.env.NODE_ENV === 'development' 
      ? '/api/mock/coaching/sessions'
      : '/api/coaching/sessions';
      
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ problemId }),
    });
    
    const data = await response.json();
    if (data.success && data.session) {
      return data.session;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
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

// Interview related API calls
export const getInterviewProblems = async () => {
  const response = await fetch('/api/interviews/problems');
  return response.json();
};

export const startInterview = async (problemId) => {
  try {
    const response = await api.post('/api/interviews/start', { problemId });
    return response.data;
  } catch (error) {
    console.error('Start interview API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // For development, return mock data
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        interview: {
          id: '1',
          problemId,
          startedAt: new Date().toISOString()
        }
      };
    }
    
    throw error;
  }
};

export const getInterviewResults = async (id) => {
  const response = await fetch(`/api/interviews/results/${id}`);
  return response.json();
};

export const sendInterviewMessage = async (id, message) => {
  const response = await fetch(`/api/interviews/${id}/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
  return response.json();
};

export const completeInterview = async (id) => {
  const response = await fetch(`/api/interviews/${id}/complete`, {
    method: 'POST',
  });
  return response.json();
};

export const getInterview = async (id) => {
  const response = await fetch(`${API_BASE_URL}/interviews/${id}`);
  return response.json();
};

// Helper function for making authenticated requests
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Error handling wrapper
const handleApiError = (error) => {
  console.error('API Error:', error);
  throw error;
};

// Export the helper functions as well
export const apiHelpers = {
  fetchWithAuth,
  handleApiError,
};

export default api;
