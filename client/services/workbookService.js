import api from '../utils/api'; // Import the configured axios instance
import Cookies from 'js-cookie';

export const workbookService = {
  getChat: (userId, problemId) => {
    // Implementation
    return null;
  },
  saveChat: (userId, problemId, messages) => {
    // Implementation
  },
  getDiagram: (userId, problemId, type) => {
    // Implementation
    return null;
  },
  saveDiagram: (userId, problemId, diagramData, type) => {
    // Implementation
  },
  getProgress: (userId, problemId) => {
    // Implementation
    return null;
  },
  saveProgress: (userId, problemId, sections) => {
    // Implementation
  },
  saveAllData: async (sessionId, section, data) => {
    // Ensure we have a session ID
    if (!sessionId) {
      console.error('saveAllData requires a sessionId');
      throw new Error('Session ID is required to save workbook data.');
    }

    try {
      // Make the API call to the backend (port 2000)
      const response = await api.post(`/api/workbook/${sessionId}/save`, {
        section, // Include section info if needed by backend
        data,    // The actual data payload
      });
      
      // Check if the request was successful
      if (response.data && response.data.status === 'success') {
        console.log(`Workbook data for section '${section}' saved successfully.`);
        return response.data;
      } else {
        // Handle cases where the API responds but indicates failure
        console.error('Failed to save workbook data:', response.data);
        throw new Error(response.data?.error || 'Failed to save workbook data on server.');
      }
    } catch (error) {
      // Handle network errors or errors thrown from the try block
      console.error('Error calling save workbook API:', { 
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      // Re-throw the error to be caught by the calling component
      throw error; 
    }
  }
};
