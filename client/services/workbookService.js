class WorkbookService {
  constructor() {
    this.currentData = null;
    this.currentProblemId = null;
    this.currentUserId = null;
    this.saveQueue = [];
    this.isSaving = false;
  }

  async switchProblem(userId, problemId) {
    // Save current problem data if exists
    if (this.currentProblemId && this.currentUserId) {
      await this.saveAllData(this.currentUserId, this.currentProblemId);
    }

    // Load new problem data
    this.currentProblemId = problemId;
    this.currentUserId = userId;
    
    // Try loading from localStorage first
    const localData = this.loadFromLocal(userId, problemId);
    
    // Then fetch from server and merge if newer
    if (navigator.onLine) {
      const serverData = await this.fetchFromServer(userId, problemId);
      this.currentData = this.mergeData(localData, serverData);
    } else {
      this.currentData = localData;
    }

    return this.currentData;
  }

  async getDiagram(userId, problemId, type) {
    try {
      // Validate user
      if (userId !== this.currentUserId) return null;

      // Return from memory if available
      if (this.currentData?.diagrams?.[type]) {
        return this.currentData.diagrams[type];
      }

      // Try localStorage
      const key = `diagram_${userId}_${problemId}_${type}`;
      const cached = localStorage.getItem(key);
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    } catch (err) {
      console.error('Error getting diagram:', err);
      return null;
    }
  }

  async saveDiagram(userId, problemId, data, type) {
    try {
      // Update memory
      if (!this.currentData) this.currentData = {};
      if (!this.currentData.diagrams) this.currentData.diagrams = {};
      this.currentData.diagrams[type] = data;

      // Save to localStorage
      const key = `diagram_${userId}_${problemId}_${type}`;
      localStorage.setItem(key, JSON.stringify(data));

      // Queue server save
      await this.queueSave({
        type: 'diagram',
        problemId,
        userId,
        data: {
          type,
          content: data
        }
      });
    } catch (err) {
      console.error('Error saving diagram:', err);
    }
  }

  async getChat(userId, problemId) {
    try {
      const key = `chat_${userId}_${problemId}`;
      const cached = localStorage.getItem(key);
      if (cached) {
        return JSON.parse(cached);
      }
      return [];
    } catch (err) {
      console.error('Error getting chat:', err);
      return [];
    }
  }

  async saveChat(userId, problemId, messages) {
    try {
      // Save to localStorage
      const key = `chat_${userId}_${problemId}`;
      localStorage.setItem(key, JSON.stringify(messages));

      // Try to sync with backend
      if (navigator.onLine) {
        await fetch('/api/workbook/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'chat',
            userId,
            problemId,
            data: messages
          })
        });
      }
    } catch (err) {
      console.error('Error saving chat:', err);
    }
  }

  async getProgress(userId, problemId) {
    try {
      const key = `progress_${userId}_${problemId}`;
      const cached = localStorage.getItem(key);
      if (cached) {
        return JSON.parse(cached);
      }
      return {};
    } catch (err) {
      console.error('Error getting progress:', err);
      return {};
    }
  }

  async saveProgress(userId, problemId, data) {
    try {
      // Save to localStorage
      const key = `progress_${userId}_${problemId}`;
      localStorage.setItem(key, JSON.stringify(data));

      // Try to sync with backend
      if (navigator.onLine) {
        await fetch('/api/workbook/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'progress',
            userId,
            problemId,
            data
          })
        });
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  }

  async saveAllData(problemId, currentPage, pageData = {}) {
    if (!problemId) {
      console.warn('saveAllData called without problemId');
      return;
    }

    const fullState = {
      currentPage,
      lastModified: new Date().toISOString(),
      sections: {
        ...pageData.sections,
      },
      progress: {
        ...pageData.progress,
      }
    };

    // Save to localStorage for immediate access
    this.saveToLocal(problemId, fullState);

    // Save to server
    if (navigator.onLine) {
      try {
        await this.saveToServer(problemId, fullState);
      } catch (error) {
        console.error('Failed to save to server:', error);
        // Continue with local save even if server fails
      }
    }

    return fullState;
  }

  saveToLocal(problemId, state) {
    const key = `workbook_${problemId}_state`;
    localStorage.setItem(key, JSON.stringify({
      ...state,
      lastSavedLocal: new Date().toISOString()
    }));
  }

  async queueSave(saveData) {
    this.saveQueue.push(saveData);
    await this.processSaveQueue();
  }

  async processSaveQueue() {
    if (this.isSaving || this.saveQueue.length === 0) return;

    this.isSaving = true;
    const item = this.saveQueue[0];

    try {
      await this.saveToServer(item);
      this.saveQueue.shift();
    } catch (error) {
      console.error('Save failed:', error);
      // Keep in queue for retry if it's not a fatal error
      if (this.saveQueue.length > 0 && this.saveQueue[0].retryCount < 3) {
        this.saveQueue[0].retryCount = (this.saveQueue[0].retryCount || 0) + 1;
      } else {
        this.saveQueue.shift(); // Remove after max retries
      }
    } finally {
      this.isSaving = false;
      if (this.saveQueue.length > 0) {
        await this.processSaveQueue();
      }
    }
  }

  async saveToServer(saveData) {
    const { type, problemId, data } = saveData;
    
    return fetch('/api/workbook/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        problemId,
        data,
        timestamp: new Date().toISOString()
      })
    });
  }

  // Add method to load full state
  async loadFullState(userId, problemId) {
    const key = `workbook_${problemId}_state`;
    const localState = localStorage.getItem(key);
    
    if (localState) {
      return JSON.parse(localState);
    }
    
    // If no local state, try server
    if (navigator.onLine) {
      try {
        const response = await fetch(`/api/workbook/state/${problemId}`);
        const serverState = await response.json();
        this.saveToLocal(problemId, serverState); // Cache it locally
        return serverState;
      } catch (error) {
        console.error('Failed to load state from server:', error);
        return null;
      }
    }
    
    return null;
  }

  async savePage(sessionId, pageId, pageData) {
    // Save to local storage first
    this._saveToLocal(sessionId, pageId, pageData);

    // Then save to server
    try {
      const response = await fetch(`/api/workbook/${sessionId}/pages/${pageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData)
      });

      if (!response.ok) {
        throw new Error(`Failed to save ${pageId}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error saving ${pageId}:`, error);
      throw error;
    }
  }

  _saveToLocal(sessionId, pageId, pageData) {
    const key = `workbook_${sessionId}_${pageId}`;
    localStorage.setItem(key, JSON.stringify({
      ...pageData,
      lastSavedLocal: new Date().toISOString()
    }));
  }

  async loadPage(sessionId, pageId) {
    // Try local storage first
    const localData = this._loadFromLocal(sessionId, pageId);
    
    // If online, fetch from server and update local
    if (navigator.onLine) {
      try {
        const response = await fetch(`/api/workbook/${sessionId}/pages/${pageId}`);
        if (response.ok) {
          const serverData = await response.json();
          this._saveToLocal(sessionId, pageId, serverData);
          return serverData;
        }
      } catch (error) {
        console.error(`Error loading ${pageId} from server:`, error);
      }
    }
    
    return localData;
  }

  _loadFromLocal(sessionId, pageId) {
    const key = `workbook_${sessionId}_${pageId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  calculateSectionProgress(sectionData, sectionType) {
    switch (sectionType) {
      case 'requirements':
        const allReqs = [
          ...sectionData.functional || [],
          ...sectionData.nonFunctional || [],
          ...sectionData.constraints || []
        ];
        return allReqs.length ? 
          (allReqs.filter(req => req.status === 'complete').length / allReqs.length) * 100 
          : 0;
      
      // Add cases for other section types...
      
      default:
        return 0;
    }
  }
}

export default new WorkbookService();
