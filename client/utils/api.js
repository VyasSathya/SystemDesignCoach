// client/utils/api.js (with fixed createDefaultSession)
import axios from 'axios';
import Cookies from 'js-cookie';

// Create an Axios instance with a base URL
const API_URL = typeof window !== 'undefined' ? 
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') : 
  'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // Increase timeout to 60 seconds
  retries: 3,
  retryDelay: 1000,
});

// Add retry logic to axios
api.interceptors.response.use(null, async (error) => {
  const { config } = error;
  if (!config || !config.retries) return Promise.reject(error);
  
  config.retryCount = config.retryCount || 0;
  
  if (config.retryCount >= config.retries) {
    return Promise.reject(error);
  }
  
  config.retryCount += 1;
  console.log(`Retrying request (${config.retryCount}/${config.retries})`);
  
  // Wait before retrying
  await new Promise(resolve => setTimeout(resolve, config.retryDelay));
  return api(config);
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

// Helper to create a default session for development/fallback
function createDefaultSession(id = 'default') {
  return {
    id,
    problem: { 
      id: 'mock-problem',
      title: 'System Design Coaching Session'
    },
    conversation: [{
      role: 'assistant',
      content: "Welcome to your system design coaching session! I'm here to help you work through design challenges and improve your system architecture skills. What would you like to focus on today?",
      timestamp: new Date().toISOString()
    }],
    currentStage: 'introduction',
    status: 'in_progress',
    startedAt: new Date().toISOString()
  };
}

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

export const startCoachingSession = async (problemId, options = {}) => {
  try {
    console.log('API: Starting coaching session for:', problemId);
    
    const payload = { };
    
    // Add optional parameters if provided
    if (options.userLevel) payload.userLevel = options.userLevel;
    if (options.conciseMode !== undefined) payload.conciseMode = options.conciseMode;
    
    const response = await api.post(`/api/coaching/start/${problemId}`, payload);
    console.log('API: Session start response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('API: Error starting coaching session:', error);
    throw error;
  }
};

export const getCoachingSession = async (id) => {
  if (!id) {
    console.log("No session ID provided, returning default session");
    return createDefaultSession();
  }
  
  try {
    console.log(`Attempting to fetch coaching session with ID: ${id}`);
    const response = await api.get(`/api/coaching/${id}`);
    console.log("Coaching session response:", response.data);
    
    // Ensure the response has the necessary structure
    return {
      ...response.data,
      conversation: response.data.conversation && response.data.conversation.length > 0 
        ? response.data.conversation 
        : [{
            role: 'assistant',
            content: `Welcome to your ${response.data.problem?.title || 'system design'} coaching session!`,
            timestamp: new Date().toISOString()
          }]
    };
  } catch (error) {
    console.error(`Error fetching coaching session ${id}:`, error);
    
    // Create a mock session that will work for demo purposes
    console.log("Creating mock session for demonstration");
    return createDefaultSession(id);
  }
};

export const sendCoachingMessage = async (sessionId, message, contextInfo = null) => {
  try {
    if (!sessionId) {
      console.error("No sessionId provided to sendCoachingMessage");
      throw new Error("No sessionId provided");
    }
    
    if (!message || typeof message !== 'string' || message.trim() === '') {
      console.error("Invalid message provided to sendCoachingMessage");
      throw new Error("Invalid message format");
    }
    
    // Make API call with error handling
    try {
      console.log(`Sending message for session ${sessionId}:`, message);
      const response = await api.post(`/api/coaching/${sessionId}/message`, { 
        message,
        contextInfo // Include contextInfo which may contain userLevel and conciseMode
      });
      
      console.log("Message response:", response.data);
      return response.data;
    } catch (apiError) {
      console.error("API error in sendCoachingMessage:", apiError.response?.data || apiError.message);
      
      // Return a formatted error response instead of throwing
      return {
        message: {
          role: 'coach',
          content: "I'm having trouble connecting to the server. Please try again in a moment.",
          timestamp: new Date().toISOString(),
          error: true
        }
      };
    }
  } catch (error) {
    console.error("Error in sendCoachingMessage:", error);
    
    // Return a formatted error that matches the expected response structure
    return {
      message: {
        role: 'coach',
        content: "Error processing message. Please try again with a different question.",
        timestamp: new Date().toISOString(),
        error: true
      }
    };
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