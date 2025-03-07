import axios from 'axios';
import Cookies from 'js-cookie';

// Create an Axios instance with a base URL
// Fix: Ensure NEXT_PUBLIC_API_URL is properly set or defaulted
const API_URL = typeof window !== 'undefined' ? 
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') : 
  'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Add timeout for better error handling
});

// Attach the auth token to every request if present
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error('API Error Request:', error.request);
    } else {
      console.error('API Error Message:', error.message);
    }
    return Promise.reject(error);
  }
);

// === Authentication APIs ===
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const registerUser = async (name, email, password, experience) => {
  try {
    const response = await api.post('/api/auth/register', { name, email, password, experience });
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const getMe = async () => {
  try {
    const response = await api.get('/api/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post('/api/auth/logout');
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// === Interview APIs ===
export const sendInterviewMessage = async (interviewId, message) => {
  try {
    const response = await api.post(`/api/interviews/${interviewId}/message`, { message });
    return response.data;
  } catch (error) {
    console.error('Error sending interview message:', error);
    throw error;
  }
};

export const getInterviews = async () => {
  try {
    const response = await api.get('/api/interviews');
    return response.data;
  } catch (error) {
    console.error('Error fetching interviews:', error);
    throw error;
  }
};

export const getInterview = async (id) => {
  try {
    const response = await api.get(`/api/interviews/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching interview:', error);
    throw error;
  }
};

export const getInterviewProblems = async () => {
  try {
    const response = await api.get('/api/interviews/problems');
    return response.data;
  } catch (error) {
    console.error('Error fetching interview problems:', error);
    throw error;
  }
};

export const startInterview = async (problemId) => {
  try {
    const response = await api.post('/api/interviews/start', { problemId });
    return response.data;
  } catch (error) {
    console.error('Error starting interview:', error);
    throw error;
  }
};

export const completeInterview = async (interviewId) => {
  try {
    const response = await api.post(`/api/interviews/${interviewId}/complete`);
    return response.data;
  } catch (error) {
    console.error('Error completing interview:', error);
    throw error;
  }
};

export const sendMessage = async (interviewId, message) => {
  try {
    const response = await api.post(`/api/interviews/${interviewId}/message`, { message });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const endInterview = async (interviewId) => {
  try {
    const response = await api.post(`/api/interviews/${interviewId}/end`);
    return response.data;
  } catch (error) {
    console.error('Error ending interview:', error);
    throw error;
  }
};

export const getInterviewResults = async (interviewId) => {
  try {
    const response = await api.get(`/api/interviews/${interviewId}/results`);
    return response.data;
  } catch (error) {
    console.error('Error fetching interview results:', error);
    throw error;
  }
};

// === Coaching APIs ===
export const getCoachingSessions = async () => {
  try {
    const response = await api.get('/api/coaching');
    return response.data;
  } catch (error) {
    console.error('Error fetching coaching sessions:', error);
    throw error;
  }
};

export const getCoachingProblems = async () => {
  try {
    const response = await api.get('/api/coaching/problems');
    return response.data;
  } catch (error) {
    console.error('Error fetching coaching problems:', error);
    throw error;
  }
};

export const getCoachingSession = async (id) => {
  if (!id) {
    console.error('Error: No coaching session ID provided');
    throw new Error('Coaching session ID is required');
  }
  
  try {
    const response = await api.get(`/api/coaching/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching coaching session ${id}:`, error);
    throw error;
  }
};

export const startCoachingSession = async (problemId) => {
  try {
    const response = await api.post(`/api/coaching/start/${problemId}`);
    return response.data;
  } catch (error) {
    console.error('Error starting coaching session:', error);
    throw error;
  }
};

export const sendCoachingMessage = async (sessionId, message) => {
  try {
    const response = await api.post(`/api/coaching/${sessionId}/message`, { message });
    return response.data;
  } catch (error) {
    console.error('Error sending coaching message:', error);
    throw error;
  }
};

export const getCoachingMaterials = async (sessionId, topic) => {
  try {
    const response = await api.post(`/api/coaching/${sessionId}/materials`, { topic });
    return response.data;
  } catch (error) {
    console.error('Error fetching coaching materials:', error);
    throw error;
  }
};

// === Diagram APIs ===
export const getInterviewDiagram = async (interviewId, diagramType = 'architecture', customPrompt = null) => {
  try {
    const response = await api.post(`/api/interviews/${interviewId}/diagram`, {
      diagramType,
      customPrompt
    });
    return response.data;
  } catch (error) {
    console.error('Error generating interview diagram:', error);
    throw error;
  }
};

export const getCoachingDiagram = async (sessionId, diagramType = 'architecture', customPrompt = null) => {
  try {
    const response = await api.post(`/api/coaching/${sessionId}/diagram`, {
      diagramType,
      customPrompt
    });
    return response.data;
  } catch (error) {
    console.error('Error generating coaching diagram:', error);
    throw error;
  }
};

export const getDiagramTypes = async () => {
  try {
    const response = await api.get('/api/interviews/diagram/types');
    return response.data.types;
  } catch (error) {
    console.error('Error fetching diagram types:', error);
    return {
      ARCHITECTURE: 'architecture',
      ER: 'entity-relationship',
      SEQUENCE: 'sequence',
      API: 'api',
      COMPONENT: 'component',
      FLOW: 'flow'
    };
  }
};

// === Problem APIs ===
export const getProblems = async () => {
  try {
    const response = await api.get('/api/problems');
    return response.data;
  } catch (error) {
    console.error('Error fetching problems:', error);
    throw error;
  }
};

export const getProblem = async (id) => {
  try {
    const response = await api.get(`/api/problems/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching problem:', error);
    throw error;
  }
};

export default api;