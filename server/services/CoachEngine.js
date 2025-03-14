class CoachEngine {
  constructor() {
    this.aiService = global.aiService;
  }

  async handleMessage(sessionId, userId, message, contextInfo = null) {
    try {
      if (!this.aiService) {
        throw new Error('AI Service not initialized');
      }

      // Prepare the context for the AI
      const context = {
        sessionId,
        userId,
        ...(contextInfo || {})
      };

      // Get response from AI service
      const response = await this.aiService.getResponse(message, context);

      return {
        message: {
          role: 'assistant',
          content: response.content,
          timestamp: new Date().toISOString()
        },
        diagramSuggestions: contextInfo?.requestDiagramSuggestions ? {
          mermaidCode: response.diagramSuggestions || null
        } : null
      };
    } catch (error) {
      console.error('Error in CoachEngine.handleMessage:', error);
      throw new Error(`Failed to process message: ${error.message}`);
    }
  }
}

module.exports = CoachEngine;