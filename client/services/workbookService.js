class WorkbookService {
  constructor() {
    this.baseStorageKey = 'workbook';
  }

  getStorageKey(userId, problemId, type) {
    return `${this.baseStorageKey}_${userId}_${problemId}_${type}`;
  }

  // Diagram specific methods
  saveDiagram(userId, problemId, diagramData, type = 'system') {
    const key = this.getStorageKey(userId, problemId, `diagram_${type}`);
    localStorage.setItem(key, JSON.stringify(diagramData));
  }

  getDiagram(userId, problemId, type = 'system') {
    const key = this.getStorageKey(userId, problemId, `diagram_${type}`);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  }

  // Chat/conversation methods
  saveChat(userId, problemId, chatData) {
    const key = this.getStorageKey(userId, problemId, 'chat');
    localStorage.setItem(key, JSON.stringify(chatData));
  }

  getChat(userId, problemId) {
    const key = this.getStorageKey(userId, problemId, 'chat');
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  }

  // Workbook progress methods
  saveProgress(userId, problemId, progressData) {
    const key = this.getStorageKey(userId, problemId, 'progress');
    localStorage.setItem(key, JSON.stringify(progressData));
  }

  getProgress(userId, problemId) {
    const key = this.getStorageKey(userId, problemId, 'progress');
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  }

  // Clear all data for a specific problem
  clearProblemData(userId, problemId) {
    const types = ['diagram_system', 'diagram_sequence', 'chat', 'progress'];
    types.forEach(type => {
      const key = this.getStorageKey(userId, problemId, type);
      localStorage.removeItem(key);
    });
  }

  // Clear all user data
  clearUserData(userId) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.includes(`${this.baseStorageKey}_${userId}`)) {
        localStorage.removeItem(key);
      }
    }
  }
}

export const workbookService = new WorkbookService();