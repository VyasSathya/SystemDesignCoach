import { Anthropic } from '@anthropic-ai/sdk';
import { AI_CONFIG } from '../../../../config/aiConfig';
import { COACH_PERSONA } from '../../../../data/persona/coachPersona';
import { problems } from '../../../../data/persona/coachPersona';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const { messages, options } = req.body;
  
  try {
    // Use the existing coach persona configuration
    const systemPrompt = options?.contextInfo?.designContext 
      ? `${COACH_PERSONA.systemPrompt}\n\nContext: ${options.contextInfo.designContext}`
      : COACH_PERSONA.systemPrompt;

    const response = await anthropic.messages.create({
      model: AI_CONFIG.model,
      max_tokens: AI_CONFIG.maxTokens,
      messages: messages,
      system: systemPrompt,
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
}
