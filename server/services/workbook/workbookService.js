class WorkbookService {
  constructor() {
    this.workbooks = new Map();
    this.versions = new Map();
  }

  async saveWorkbook(sessionId, data, userId) {
    if (!sessionId) throw new Error('Session ID is required');
    
    this.workbooks.set(sessionId, {
      ...data,
      userId,
      lastModified: new Date()
    });

    if (!this.versions.has(sessionId)) {
      this.versions.set(sessionId, []);
    }
    
    const versions = this.versions.get(sessionId);
    versions.push({
      timestamp: new Date(),
      data: { ...data },
      userId
    });

    return { status: 'success' };
  }

  async saveWithRetry(sessionId, data, userId) {
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch('/api/workbook/save', {
          method: 'POST',
          body: JSON.stringify({ sessionId, data, userId })
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        attempts++;
        if (attempts === maxAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  async getWorkbook(sessionId) {
    if (!sessionId) throw new Error('Session ID is required');
    return this.workbooks.get(sessionId) || null;
  }

  async getVersionHistory(sessionId) {
    if (!sessionId) throw new Error('Session ID is required');
    
    const versions = this.versions.get(sessionId) || [];
    return versions.map((version, index) => {
      if (index === 0) {
        return {
          ...version,
          changes: {
            added: Object.keys(version.data),
            modified: [],
            deleted: []
          }
        };
      }

      const previousVersion = versions[index - 1];
      return {
        ...version,
        changes: this.calculateChanges(previousVersion.data, version.data)
      };
    });
  }

  calculateChanges(oldData, newData) {
    const changes = {
      added: [],
      modified: [],
      deleted: []
    };

    Object.keys(newData).forEach(key => {
      if (!(key in oldData)) {
        changes.added.push(key);
      } else if (oldData[key] !== newData[key]) {
        changes.modified.push(key);
      }
    });

    Object.keys(oldData).forEach(key => {
      if (!(key in newData)) {
        changes.deleted.push(key);
      }
    });

    return changes;
  }
}

module.exports = { WorkbookService };