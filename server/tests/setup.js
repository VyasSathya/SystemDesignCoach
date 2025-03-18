require('dotenv').config({ path: '.env.test' });

// Fallback values if env variables are not loaded
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb+srv://vyassathya:SanD!eg0@system-design-db.24esv.mongodb.net/systemdesigncoach-test?retryWrites=true&w=majority';
}

if (!process.env.ANTHROPIC_API_KEY) {
  process.env.ANTHROPIC_API_KEY = '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';
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}
