require('dotenv').config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
  // Database connection for all tests
  await require('../config/db')();
});

// Mock AI configurations
jest.mock('../config/aiConfig', () => ({
  config: {
    apiKey: 'test-key',
    model: 'claude-3-7-sonnet-latest',
    maxTokens: 1000
  }
}));

// Clean up after all tests
afterAll(async () => {
  await mongoose.connection.close();
});
