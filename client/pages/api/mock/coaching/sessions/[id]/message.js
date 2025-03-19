import { Anthropic } from '@anthropic-ai/sdk';
import { AI_CONFIG } from '../../../../../../config/aiConfig';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: sessionId } = req.query;
  const { message, contextInfo } = req.body;

  try {
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await anthropic.messages.create({
      model: AI_CONFIG.model,
      max_tokens: AI_CONFIG.maxTokens,
      messages: [{
        role: 'user',
        content: message
      }],
      system: AI_CONFIG.defaultSystemPrompt,
      temperature: AI_CONFIG.temperature,
    });

    return res.status(200).json({
      message: {
        role: 'assistant',
        content: response.content[0].text,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error processing message:', error);
    return res.status(500).json({ 
      error: 'Failed to process message',
      details: error.message 
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};

