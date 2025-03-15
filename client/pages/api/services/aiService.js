import { Configuration, OpenAIApi } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { AI_CONFIG } from '../../../config/aiConfig';

export class AIService {
  constructor(config) {
    this.provider = config.provider || 'claude';
    this.config = config;
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async sendMessage(messages, options = {}) {
    try {
      const systemPrompt = options.systemPrompt || "You are a helpful AI assistant";
      
      const response = await this.anthropic.messages.create({
        model: AI_CONFIG.model,
        max_tokens: 1000,
        messages: messages,
        system: systemPrompt,
        temperature: options.temperature || 0.7,
      });

      return response.content[0].text;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to get AI response');
    }
  }
}

export const config = {
  provider: 'claude',
  defaultSystemPrompt: "You are an expert system design coach. Help guide the developer through architectural decisions and trade-offs.",
};

export const aiService = new AIService(config);