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
  saveAllData: async (problemId, activePage, data) => {
    // Ensure we have a problem ID
    if (!problemId) {
      console.error('saveAllData requires a problemId');
      throw new Error('Problem ID is required to save workbook data.');
    }

    try {
      // Make the API call to the new backend endpoint
      // POST /api/workbook/{problemId}/save
      console.log(`Calling save API: /api/workbook/${problemId}/save`); // Log the endpoint being called
      const response = await api.post(`/api/workbook/${problemId}/save`, {
        // The backend route now expects the data directly in the body
        // It doesn't need the activePage explicitly unless the backend uses it
        data: data, // Send the whole data object (sections, diagrams, progress)
      });
      
      // Check if the request was successful
      if (response.data && response.data.success === true) {
        console.log(`Workbook data for problem '${problemId}' saved successfully.`);
        return response.data; // Return the updated workbook data from backend
      } else {
        // Handle cases where the API responds but indicates failure
        console.error('Failed to save workbook data (API success=false):', response.data);
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
  },

  loadProblemData: async (problemId) => {
    if (!problemId) {
      console.error('loadProblemData requires a problemId');
      throw new Error('Problem ID is required to load workbook data.');
    }

    try {
      // Make the API call to get workbook data for the specific problem ID
      const response = await api.get(`/api/workbook/${problemId}`);
      
      // Check if the request was successful and data exists
      if (response.data && response.status === 200) {
        console.log(`Workbook data for problem '${problemId}' loaded successfully.`);
        // The backend should return the data in the expected format 
        // { sections: {...}, diagrams: {...}, progress: {...}, etc. }
        return response.data; 
      } else {
        // Handle cases where the API responds but indicates failure or no data
        console.error('Failed to load workbook data:', response.data);
        throw new Error(response.data?.error || 'Failed to load workbook data from server.');
      }
    } catch (error) {
      // Handle network errors or errors thrown from the try block
      console.error('Error calling load workbook API:', { 
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      // Re-throw the error 
      throw error; 
    }
  }
};
