const request = require('supertest');
const app = require('../app');
const { config } = require('../config/aiConfig');

describe('AI API Endpoints', () => {
  test('POST /api/ai/message', async () => {
    const response = await request(app)
      .post('/api/ai/message')
      .send({
        sessionId: 'test-session',
        message: 'How do I design a scalable system?',
        context: { topic: 'system design' }
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.response).toBeDefined();
  });

  test('POST /api/ai/analyze-diagram', async () => {
    const response = await request(app)
      .post('/api/ai/analyze-diagram')
      .send({
        sessionId: 'test-session',
        diagram: {
          nodes: [
            { id: '1', type: 'service', data: { label: 'API Gateway' } },
            { id: '2', type: 'database', data: { label: 'PostgreSQL' } }
          ],
          edges: [
            { id: 'e1-2', source: '1', target: '2' }
          ]
        }
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.analysis).toBeDefined();
  });
});