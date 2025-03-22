export class MockStorageService {
  constructor() {
    this.storage = new Map();
  }

  async getWorkbookData(sessionId) {
    return this.storage.get(sessionId);
  }

  async saveWorkbookData(sessionId, data) {
    this.storage.set(sessionId, data);
    return { status: 'success' };
  }
}