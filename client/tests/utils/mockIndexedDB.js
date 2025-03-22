export const mockIndexedDB = {
  openDB: jest.fn().mockImplementation(() => ({
    createObjectStore: jest.fn(),
    put: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(undefined)
  }))
};

// Setup mock IndexedDB
global.indexedDB = mockIndexedDB;