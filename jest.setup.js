jest.mock('./server/config/aiConfig', () => ({
  config: {
    apiKey: 'test-key',
    model: 'claude-3-7-sonnet-latest',
    maxTokens: 1000
  }
}), { virtual: true });