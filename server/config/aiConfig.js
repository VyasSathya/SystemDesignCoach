// server/config/aiConfig.js
module.exports = {
    defaultProvider: process.env.AI_PROVIDER || 'claude',
    claude: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: 'claude-3-5-sonnet-latest',
      maxTokens: 1000,
      temperature: 0.7,
      maxRetries: 5
    }
  };
  