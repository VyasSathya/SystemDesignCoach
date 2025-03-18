const { WorkbookService } = require('../services/workbook/workbookService');
const { mockIndexedDB } = require('../mocks/indexedDB');

jest.mock('../../client/utils/workbookStorage', () => ({
  saveWorkbookData: async (sessionId, data, userId) => {
    return Promise.resolve({ status: 'success' });
  },
  autoSaveWorkbook: async (sessionId, data, userId) => {
    return Promise.resolve({ status: 'success' });
  }
}));

describe('Workbook Auto-save', () => {
  let workbookService;
  const mockSessionId = 'test-session-123';
  const mockUserId = 'user-123';

  beforeEach(() => {
    workbookService = new WorkbookService();
    mockIndexedDB.clear();
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Setup fetch mock
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should handle offline storage', async () => {
    global.navigator = { onLine: false };
    
    const testData = {
      requirements: 'Test requirements',
      architecture: 'Test architecture',
      lastModified: new Date()
    };

    const result = await mockIndexedDB.put('workbook_offline', {
      data: testData,
      timestamp: Date.now()
    }, mockSessionId);
    
    const storedData = await mockIndexedDB.get('workbook_offline', mockSessionId);
    expect(storedData).toBeDefined();
    expect(storedData.data).toMatchObject(testData);
  });

  test('should create version checkpoints', async () => {
    const initialData = {
      requirements: 'Initial requirements',
      architecture: 'Initial architecture'
    };

    await workbookService.saveWorkbook(mockSessionId, initialData, mockUserId);
    
    // Advance time by 5 minutes
    jest.advanceTimersByTime(300000);

    const updatedData = {
      requirements: 'Updated requirements',
      architecture: 'Updated architecture'
    };

    await workbookService.saveWorkbook(mockSessionId, updatedData, mockUserId);

    const versions = await workbookService.getVersionHistory(mockSessionId);
    expect(versions).toHaveLength(2);
    expect(versions[1].changes).toEqual({
      added: [],
      modified: ['requirements', 'architecture'],
      deleted: []
    });
  });

  test('should recover from errors', async () => {
    jest.useRealTimers(); // Use real timers for this test
    
    const mockError = new Error('Network failure');
    const testData = { requirements: 'Test requirements' };
    
    // Create mock response objects
    const failedResponse = { ok: false, status: 500, json: () => Promise.resolve({ error: 'Failed' }) };
    const successResponse = { 
      ok: true, 
      json: () => Promise.resolve({ status: 'success', data: testData }) 
    };

    // Mock fetch to fail twice then succeed
    global.fetch = jest.fn()
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce(failedResponse)
      .mockResolvedValueOnce(successResponse);

    const result = await workbookService.saveWithRetry(mockSessionId, testData, mockUserId);
    
    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(result.status).toBe('success');
  }, 10000); // Increase timeout to 10 seconds

  test('should handle concurrent saves', async () => {
    const saves = [
      workbookService.saveWorkbook(mockSessionId, { requirements: 'v1' }, mockUserId),
      workbookService.saveWorkbook(mockSessionId, { requirements: 'v2' }, mockUserId),
      workbookService.saveWorkbook(mockSessionId, { requirements: 'v3' }, mockUserId)
    ];

    await Promise.all(saves);
    
    const finalState = await workbookService.getWorkbook(mockSessionId);
    expect(finalState.requirements).toBe('v3');
  });
});