const request = require('supertest');
const app = require('../../app'); // Adjust path as needed

describe('API Endpoints', () => {
  test('GET /api/health should return 200', async () => {
    const response = await request(app).get('/api/health');
    expect(response.statusCode).toBe(200);
  });
});