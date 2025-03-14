import { saveDiagram } from './api';

// Debounce function to prevent too frequent saves
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const saveWorkbookData = async (sessionId, workbookData, userId) => {
  if (!sessionId) {
    throw new Error('Session ID is required');
  }

  try {
    // Save diagram data separately using existing saveDiagram function
    if (workbookData.diagram) {
      await saveDiagram(sessionId, workbookData.diagram);
    }

    // Save workbook data
    const response = await fetch(`/api/workbook/${sessionId}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        apis: workbookData.apis,
        apiType: workbookData.apiType,
        requirements: workbookData.requirements,
        architecture: workbookData.architecture,
        lastModified: new Date()
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save workbook data');
    }

    console.log(`Workbook saved successfully at ${new Date().toISOString()}`);
    return await response.json();
  } catch (error) {
    console.error('Error saving workbook:', error);
    throw error;
  }
};

// Create a debounced version for auto-save
export const autoSaveWorkbook = debounce(saveWorkbookData, 3000);