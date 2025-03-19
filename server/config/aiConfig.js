const config = {
  defaultProvider: 'claude',
  claude: {
    apiKey: process.env.ANTHROPIC_API_KEY || 'test-key',
    model: 'claude-3-7-sonnet-latest',
    maxTokens: 1000,
    temperature: 0.7,
    defaultSystemPrompt: "You are an expert system design coach. Help guide the developer through architectural decisions and trade-offs."
  }
};

module.exports = {
  config
};
