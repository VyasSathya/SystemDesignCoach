require('dotenv').config({ path: '.env.test' });

// Fallback values if env variables are not loaded
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/systemdesigncoach-test';
}

// Ensure required test environment variables are set
const requiredEnvVars = ['TEST_ANTHROPIC_API_KEY', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required test environment variables: ${missingVars.join(', ')}`);
}

// Set up test environment
process.env.ANTHROPIC_API_KEY = process.env.TEST_ANTHROPIC_API_KEY;
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
