const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { default: Anthropic } = require('@anthropic-ai/sdk');
const { config } = require('./config/aiConfig');

async function testAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("API key not set. Please set ANTHROPIC_API_KEY in your environment.");
    return;
  }
  
  const client = new Anthropic({ apiKey });
  
  try {
    model_name = 'claude-3-7-sonnet-latest'
    console.log('Making API call with model:', model_name);
    const response = await client.messages.create({
      model: model_name,
      system: "You are a test assistant.",
      messages: [{ role: "user", content: "Hello, how are you?" }],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    });
    console.log("Anthropic API response:", response.content[0].text);
  } catch (error) {
    console.error("Test API call failed:", error.response ? error.response.data : error.message);
  }
}

testAnthropic();
