const WorkbookData = require('../../models/WorkbookData');
const logger = require('../../utils/logger');

class WorkbookService {
  constructor() {
    this.storage = require('./workbookStorage');
  }

  async saveWorkbook(sessionId, data, userId) {
    return this.storage.saveWorkbookData(sessionId, data, userId);
  }

  async getWorkbook(sessionId) {
    return this.storage.getWorkbookData(sessionId);
  }

  async getVersionHistory(sessionId) {
    // Mock implementation for now
    return [
      { version: 1, timestamp: Date.now() - 1000, changes: { added: [], modified: [], deleted: [] } },
      { version: 2, timestamp: Date.now(), changes: { added: [], modified: ['requirements', 'architecture'], deleted: [] } }
    ];
  }

  async saveWithRetry(sessionId, data, maxRetries = 3) {
    let attempts = 0;
    
    while (attempts < maxRetries) {
      try {
        const response = await fetch(`/api/workbook/${sessionId}/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        // Only throw for non-200 status codes
        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        attempts++;
        if (attempts === maxRetries) {
          throw error;
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 100));
      }
    }
  }
}

module.exports = { WorkbookService };
