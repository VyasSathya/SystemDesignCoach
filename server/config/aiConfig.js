const AI_PROVIDER = 'claude';
const CLAUDE_MODEL = 'claude-3-7-sonnet-latest';  // Single source of truth

const providers = {
  claude: {
    name: 'claude',
    model: CLAUDE_MODEL,
    maxTokens: 4096,
    temperature: 0.7,
    apiKey: process.env.ANTHROPIC_API_KEY,
    defaultSystemPrompt: "You are an expert system design coach helping developers improve their architecture and implementation decisions."
  }
};

module.exports = {
  activeProvider: AI_PROVIDER,
  config: providers[AI_PROVIDER],
  providers,
  CLAUDE_MODEL  // Export the constant
};
