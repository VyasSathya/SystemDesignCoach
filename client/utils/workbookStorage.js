import { saveDiagram } from './api';

let idb;
// Dynamic import for idb to handle SSR
if (typeof window !== 'undefined') {
  import('idb').then(module => {
    idb = module;
  });
}

const VERSION_INTERVAL = 300000; // Create version every 5 minutes
let lastVersionTime = Date.now();

// Enhanced debounce with error retry
const debounce = (func, wait, maxRetries = 3) => {
  let timeout;
  let retryCount = 0;

  return async function executedFunction(...args) {
    const later = async () => {
      clearTimeout(timeout);
      try {
        await func(...args);
        retryCount = 0; // Reset on success
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++;
          timeout = setTimeout(later, 1000); // Retry after 1s
        } else {
          throw error; // Max retries exceeded
        }
      }
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const saveWorkbookData = async (sessionId, workbookData, userId, onSaveStatus) => {
  if (!sessionId) {
    throw new Error('Session ID is required');
  }

  try {
    onSaveStatus?.('saving');
    
    // Create version history if enough time has passed
    const shouldCreateVersion = Date.now() - lastVersionTime >= VERSION_INTERVAL;
    
    // Calculate diff for version history
    const diff = shouldCreateVersion ? {
      timestamp: new Date(),
      changes: computeChanges(workbookData),
      userId
    } : null;

    // Save diagram data separately
    if (workbookData.diagram) {
      await saveDiagram(sessionId, workbookData.diagram);
    }

    const payload = {
      userId,
      apis: workbookData.apis,
      apiType: workbookData.apiType,
      requirements: workbookData.requirements,
      architecture: workbookData.architecture,
      lastModified: new Date(),
      version: shouldCreateVersion ? diff : undefined
    };

    // Try to save with offline support
    const response = await saveWithOfflineSupport(sessionId, payload);

    if (shouldCreateVersion) {
      lastVersionTime = Date.now();
    }

    onSaveStatus?.('saved');
    return response;
  } catch (error) {
    console.error('Error in saveWorkbookData:', error);
    onSaveStatus?.('error');
    
    // Store in IndexedDB for offline support
    await storeOffline(sessionId, workbookData);
    throw error;
  }
};

// Offline support utilities
const saveWithOfflineSupport = async (sessionId, payload) => {
  try {
    const response = await fetch(`/api/workbook/${sessionId}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to save: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (!navigator.onLine) {
      await storeOffline(sessionId, payload);
      return { status: 'stored_offline' };
    }
    throw error;
  }
};

// IndexedDB storage for offline support
const storeOffline = async (sessionId, data) => {
  if (!idb) return; // Skip if idb is not available
  
  const db = await idb.openDB('workbook_offline', 1, {
    upgrade(db) {
      db.createObjectStore('pending_saves');
    }
  });
  
  await db.put('pending_saves', {
    data,
    timestamp: Date.now()
  }, sessionId);
};

// Debounced version for auto-save
export const autoSaveWorkbook = debounce(saveWorkbookData, 3000);

// Compute changes for version history
const computeChanges = (currentData) => {
  // Implementation of diff calculation
  return {
    added: [],
    modified: [],
    deleted: []
  };
};

class AutoSave {
  constructor() {
    this.timeoutId = null;
    this.debounceTime = 1000;
  }

  async save(sessionId, data) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    return new Promise((resolve) => {
      this.timeoutId = setTimeout(async () => {
        try {
          const response = await fetch(`/api/workbook/${sessionId}/save`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
          
          if (!response.ok) {
            throw new Error(`Failed to save: ${response.statusText}`);
          }

          resolve(response);
        } catch (error) {
          console.error('Auto-save failed:', error);
          // Try to store offline if online save fails
          if (typeof window !== 'undefined') {
            await storeOffline(sessionId, data);
          }
          throw error;
        }
      }, this.debounceTime);
    });
  }
}

export const autoSave = new AutoSave();


