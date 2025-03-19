import Cookies from 'js-cookie';

class WorkbookService {
  constructor() {
    this.baseStorageKey = 'workbook';
    this.syncQueue = new Map();
    this.apiBase = process.env.NEXT_PUBLIC_API_URL || '';
    this.offlineKey = 'workbook_offline_queue';
  }

  // Get diagram from local storage
  getDiagram(userId, problemId, type) {
    const key = `${this.baseStorageKey}_${userId}_${problemId}_${type}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  }

  // Save diagram to local storage and sync with backend
  async saveDiagram(userId, problemId, data, type) {
    try {
      // Save to local storage first
      const key = `${this.baseStorageKey}_${userId}_${problemId}_${type}`;
      localStorage.setItem(key, JSON.stringify(data));

      // Try to sync with backend if online
      if (navigator.onLine) {
        try {
          await this.syncWithBackend(type, userId, problemId, data);
        } catch (error) {
          // Store failed sync attempt for later retry
          this.addToOfflineQueue(type, userId, problemId, data);
          console.warn('Failed to sync with backend, saved to offline queue:', error);
        }
      } else {
        // Store for later sync when back online
        this.addToOfflineQueue(type, userId, problemId, data);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save diagram:', error);
      return false;
    }
  }

  getAuthToken() {
    return Cookies.get('auth_token') || localStorage.getItem('token');
  }

  async syncWithBackend(type, userId, problemId, data, subType = null) {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const apiUrl = new URL('/api/workbook/sync', this.apiBase);
      const response = await fetch(apiUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type,
          userId,
          problemId,
          data: {
            nodes: data.nodes || [],
            edges: data.edges || [],
            mermaidCode: data.mermaidCode || '',
            type: subType
          },
          subType
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Sync error:', {
        url: `${this.apiBase}/api/workbook/sync`,
        error: error.message,
        type,
        userId,
        problemId
      });
      throw error;
    }
  }

  addToOfflineQueue(type, userId, problemId, data) {
    const queueData = {
      type,
      userId,
      problemId,
      data,
      timestamp: Date.now()
    };

    let queue = JSON.parse(localStorage.getItem(this.offlineKey) || '[]');
    queue.push(queueData);
    localStorage.setItem(this.offlineKey, JSON.stringify(queue));
  }

  async processSyncQueue() {
    if (!navigator.onLine) return;

    const queue = JSON.parse(localStorage.getItem(this.offlineKey) || '[]');
    if (queue.length === 0) return;

    const newQueue = [];
    for (const item of queue) {
      try {
        await this.syncWithBackend(
          item.type,
          item.userId,
          item.problemId,
          item.data
        );
      } catch (error) {
        newQueue.push(item);
      }
    }

    localStorage.setItem(this.offlineKey, JSON.stringify(newQueue));
  }
}

// Create singleton instance
export const workbookService = new WorkbookService();

// Add online/offline handlers
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    workbookService.processSyncQueue();
  });
}
