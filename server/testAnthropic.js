require('dotenv').config();
const { default: Anthropic } = require('@anthropic-ai/sdk');

async function testAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("API key not set. Please set ANTHROPIC_API_KEY in your environment.");
    return;
  }
  
  const client = new Anthropic({ apiKey });
  
  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-latest',
      system: "You are a test assistant.",
      messages: [{ role: "user", content: "Hello, how are you?" }],
      max_tokens: 100,
      temperature: 0.7,
    });
    console.log("Anthropic API response:", response.content[0].text);
  } catch (error) {
    console.error("Test API call failed:", error.response ? error.response.data : error.message);
  }
}

testAnthropic();
