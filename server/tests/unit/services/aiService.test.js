const { AIService } = require('../../../services/ai/aiService');

describe('AIService', () => {
  test('should initialize with valid config', () => {
    const config = {
      apiKey: 'test-key',
      model: 'claude-3-7-sonnet-latest',
      maxTokens: 1000
    };
    const aiService = new AIService(config);
    expect(aiService).toBeDefined();
  });
});