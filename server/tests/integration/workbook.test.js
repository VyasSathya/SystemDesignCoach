import request from 'supertest';
import express from 'express';
import { WorkbookService } from '../../services/workbook/workbookService';
import { generateToken } from '../../utils/auth';
import workbookRouter from '../../routes/api/workbook';

// Create express app instance for testing
const app = express();
app.use(express.json());
app.use('/api/workbook', workbookRouter);

// Mock auth middleware for testing
jest.mock('../../middleware/auth', () => {
  return (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'No token provided' });
    }
    req.user = { id: 'test-user-id' };
    next();
  };
});

describe('Workbook Auto-save', () => {
  const mockSessionId = 'test-session';
  const testData = { content: 'test' };
  let fetchMock;

  beforeEach(() => {
    fetchMock = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ 
        status: 200, 
        json: () => Promise.resolve({ status: 'success' }) 
      });
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should recover from errors', async () => {
    const workbookService = new WorkbookService();
    const result = await workbookService.saveWithRetry(mockSessionId, testData);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.status).toBe('success');
  }, 15000);
});

describe('Workbook API Authentication', () => {
  test('should reject unauthorized access', async () => {
    const response = await request(app)
      .post('/api/workbook/test-session/save')
      .send({ data: 'test' });
    
    expect(response.status).toBe(401);
  });

  test('should allow authorized access', async () => {
    const token = generateToken({ id: 'test-user-id' });
    const response = await request(app)
      .post('/api/workbook/test-session/save')
      .set('Authorization', `Bearer ${token}`)
      .send({ data: 'test' });
    
    expect(response.status).toBe(200);
  });
});




