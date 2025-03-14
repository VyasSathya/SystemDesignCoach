import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests if it exists
api.interceptors.request.use(config => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.success) {
      // Store token in cookie
      Cookies.set('auth_token', response.data.token, { expires: 7 });
      return response.data;
    } else {
      throw new Error(response.data.error || 'Login failed');
    }
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Login failed');
    }
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    console.log('Attempting registration:', userData);
    const response = await api.post('/auth/register', userData);
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data.user;
  } catch (error) {
    throw error.response?.data || error;
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
export const sendInterviewMessage = async (interviewId, message, options = {}) => {
  try {
    const payload = { message };
    
    // Add optional parameters if provided
    if (options.userLevel) payload.userLevel = options.userLevel;
    if (options.conciseMode !== undefined) payload.conciseMode = options.conciseMode;
    
    const response = await api.post(`/api/interviews/${interviewId}/message`, payload);
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

export const startInterview = async (problemId, options = {}) => {
  try {
    const payload = { problemId };
    
    // Add optional parameters if provided
    if (options.userLevel) payload.userLevel = options.userLevel;
    if (options.conciseMode !== undefined) payload.conciseMode = options.conciseMode;
    
    const response = await api.post('/api/interviews/start', payload);
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

export const sendMessage = async (interviewId, message, options = {}) => {
  try {
    const payload = { message };
    
    // Add optional parameters if provided
    if (options.userLevel) payload.userLevel = options.userLevel;
    if (options.conciseMode !== undefined) payload.conciseMode = options.conciseMode;
    
    const response = await api.post(`/api/interviews/${interviewId}/message`, payload);
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

const logPrefix = '[Client API]';

// Simplified logging helper
const logApi = {
  info: (msg, data) => console.log(`${logPrefix} ${msg}`, data),
  error: (msg, data) => console.error(`${logPrefix} ${msg}`, data)
};

export const startCoachingSession = async (problemId, options = {}) => {
  try {
    logApi.info('Starting session', { problemId });
    // Changed from /api/coaching/start/${problemId} to /coaching/start/${problemId}
    const response = await api.post(`/coaching/start/${problemId}`, options);
    logApi.info('Session created', { 
      id: response.data.id,
      problem: response.data.problem.title 
    });
    return response.data;
  } catch (error) {
    logApi.error('Session creation failed', { problemId, error: error.message });
    throw error;
  }
};

export const getCoachingSession = async (id) => {
  if (!id) {
    logApi.info('No session ID, returning default');
    return createDefaultSession();
  }
  
  try {
    logApi.info('Fetching session', { id });
    const response = await api.get(`/api/coaching/${id}`);
    return response.data;
  } catch (error) {
    logApi.error('Session fetch failed', { id, error: error.message });
    return createDefaultSession(id);
  }
};

export const sendCoachingMessage = async (sessionId, message, contextInfo = null) => {
  console.log(`${logPrefix} Sending message`, {
    sessionId,
    messageLength: message?.length,
    hasContextInfo: !!contextInfo
  });
  
  try {
    const response = await api.post(`/api/coaching/${sessionId}/message`, { 
      message,
      contextInfo
    });
    
    console.log(`${logPrefix} Message response`, {
      role: response.data.message?.role,
      contentPreview: response.data.message?.content?.substring(0, 50),
      hasDiagramSuggestions: !!response.data.diagramSuggestions
    });
    
    return response.data;
  } catch (error) {
    console.error(`${logPrefix} Error`, {
      sessionId,
      error: error.message
    });
    throw error;
  }
};

export const getCoachingMaterials = async (sessionId, topic, options = {}) => {
  // Handle missing sessionId
  if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
    console.warn('No valid sessionId provided to getCoachingMaterials');
    // Return generic materials instead of failing
    return {
      title: `Learning Materials: ${topic || 'System Design'}`,
      content: '<p>Please refresh the page or start a new session to access learning materials.</p>'
    };
  }

  try {
    const payload = { topic };
    
    // Add optional parameters if provided
    if (options.userLevel) payload.userLevel = options.userLevel;
    if (options.conciseMode !== undefined) payload.conciseMode = options.conciseMode;
    
    const response = await api.post(`/api/coaching/${sessionId}/materials`, payload);
    
    // If no materials found, return a default
    if (!response.data) {
      return {
        title: `Learning Materials: ${topic}`,
        content: '<p>No specific materials available for this topic yet.</p>'
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching coaching materials:', error);
    // Return fallback content
    return {
      title: `Learning Materials: ${topic}`,
      content: '<p>Unable to load learning materials at this time.</p>'
    };
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
  // Handle missing sessionId
  if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
    console.warn('No valid sessionId provided to getCoachingDiagram');
    return {
      mermaidCode: 'graph TD\n    Client[Client] --> API[API Gateway]\n    API --> Service[Service]\n    Service --> DB[(Database)]'
    };
  }

  try {
    const response = await api.post(`/api/coaching/${sessionId}/diagram`, {
      diagramType,
      customPrompt
    });
    
    if (!response.data || !response.data.mermaidCode) {
      return {
        mermaidCode: 'graph TD\n    Client[Client] --> API[API Gateway]\n    API  --> Service[Service]\n    Service --> DB[(Database)]'
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error generating coaching diagram:', error);
    // Return a default diagram
    return {
      mermaidCode: 'graph TD\n    Client[Client] --> API[API Gateway]\n    API  --> Service[Service]\n    Service --> DB[(Database)]'
    };
  }
};

export const saveDiagram = async (sessionId, diagramData) => {
  // Handle missing sessionId
  if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
    console.warn('No valid sessionId provided to saveDiagram');
    return { 
      success: false, 
      message: 'Session ID is required to save the diagram' 
    };
  }

  try {
    const response = await api.post(`/api/coaching/${sessionId}/diagram/save`, {
      diagram: diagramData
    });
    return response.data;
  } catch (error) {
    console.error('Error saving diagram:', error);
    // Return a simple success message even on failure to keep UI responsive
    return { success: false, message: 'Failed to save diagram, but you can continue working' };
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

// === Grader APIs ===
export const getEvaluation = async (sessionId, workbookContent, userLevel = 'mid-level', conciseMode = true) => {
  try {
    if (!sessionId) {
      console.error("No sessionId provided to getEvaluation");
      throw new Error("No sessionId provided");
    }
    
    const response = await api.post(`/api/grader/evaluate/${sessionId}`, {
      workbookContent,
      userLevel,
      conciseMode
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting evaluation:', error);
    throw error;
  }
};

export const getFinalAssessment = async (interviewId, userLevel = 'mid-level', conciseMode = true) => {
  try {
    if (!interviewId) {
      console.error("No interviewId provided to getFinalAssessment");
      throw new Error("No interviewId provided");
    }
    
    const response = await api.post(`/api/grader/assessment/${interviewId}`, {
      userLevel,
      conciseMode
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting final assessment:', error);
    throw error;
  }
};

export const getEvaluationHistory = async (sessionId) => {
  try {
    if (!sessionId) {
      console.error("No sessionId provided to getEvaluationHistory");
      throw new Error("No sessionId provided");
    }
    
    const response = await api.get(`/api/grader/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting evaluation history:', error);
    throw error;
  }
};

export const getLatestEvaluation = async (sessionId) => {
  try {
    if (!sessionId) {
      console.error("No sessionId provided to getLatestEvaluation");
      throw new Error("No sessionId provided");
    }
    
    const response = await api.get(`/api/grader/latest/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting latest evaluation:', error);
    throw error;
  }
};

export default api;