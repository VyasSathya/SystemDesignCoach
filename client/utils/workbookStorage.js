import { saveDiagram } from './api';

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

export const saveWorkbookData = async (sessionId, workbookData, userId, onSaveStatus) => {
  console.log('Saving workbook data:', { sessionId, userId });
  
  if (!sessionId) {
    console.error('Missing sessionId');
    throw new Error('Session ID is required');
  }

  try {
    console.log('Setting save status to saving');
    onSaveStatus?.('saving');

    // Save diagram data separately
    if (workbookData.diagram) {
      console.log('Saving diagram data');
      await saveDiagram(sessionId, workbookData.diagram);
    }

    console.log('Sending workbook data to API');
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
      throw new Error(`Failed to save workbook data: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Save successful:', result);
    onSaveStatus?.('saved');
    return result;
  } catch (error) {
    console.error('Error in saveWorkbookData:', error);
    onSaveStatus?.('error');
    throw error;
  }
};

// Debounced version for auto-save
export const autoSaveWorkbook = debounce((sessionId, workbookData, userId, onSaveStatus) => {
  console.log('Auto-save triggered');
  return saveWorkbookData(sessionId, workbookData, userId, onSaveStatus);
}, 3000);
