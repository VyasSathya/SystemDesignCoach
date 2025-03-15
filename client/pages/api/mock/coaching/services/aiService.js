export class AIService {
  constructor(config) {
    this.provider = config?.provider || 'claude';
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  async sendMessage(messages, options = {}) {
    try {
      const { sessionId } = options;
      // Use the full URL with baseUrl
      const response = await fetch(`${this.baseUrl}/api/ai/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          sessionId,
          context: options.context,
          provider: this.provider
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }
}

export const config = {
  provider: 'claude'
};

export const aiService = new AIService(config);