import '@testing-library/jest-dom';

// Mock IndexedDB
require('fake-indexeddb/auto');

// Mock fetch
global.fetch = jest.fn();

// Mock local storage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});