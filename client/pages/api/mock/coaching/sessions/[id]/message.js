import { Anthropic } from '@anthropic-ai/sdk';
import { CLAUDE_MODEL } from '../../../../../../config/aiConfig';

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
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: message
      }],
      system: "You are an expert system design coach helping developers improve their architecture and implementation decisions.",
      temperature: 0.7,
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
