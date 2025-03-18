const AIFactory = require('../ai/aiFactory');
const logger = require('../../utils/logger');
const { config } = require('../../config/aiConfig');
const DiagramAnalyzer = require('../ai/diagramAnalyzer');
const progressTrackingService = require('../progress/progressTrackingService');

class CoachingService {
  constructor() {
    try {
      this.ai = AIFactory.create('claude');
      this.diagramAnalyzer = new DiagramAnalyzer();
    } catch (error) {
      logger.error('Failed to initialize CoachingService:', error);
      throw error;
    }
  }

  async processMessage(sessionId, message, context = {}) {
    try {
      const messages = [{
        role: 'user',
        content: message
      }];

      // Add context to system prompt if available
      const systemPrompt = context.topic ? 
        `You are an expert system design coach focusing on ${context.topic}. ${config.defaultSystemPrompt}` :
        config.defaultSystemPrompt;

      logger.info('Sending message to AI:', {
        sessionId,
        messageCount: messages.length,
        hasContext: !!context
      });

      const response = await this.ai.sendMessage(messages, {
        systemPrompt,
        temperature: 0.7,
        maxTokens: 1000,
        context
      });

      await this._logInteraction(sessionId, message, response);
      return response;
    } catch (error) {
      logger.error('Coaching Service Error:', error);
      throw new Error('Failed to process coaching message');
    }
  }

  async analyzeDiagram(sessionId, diagram) {
    try {
      const analysis = await this.ai.analyzeDiagram(diagram, {
        sessionId,
        context: 'coaching'
      });

      await this._logInteraction(sessionId, 'Diagram Analysis Request', analysis);
      return analysis;
    } catch (error) {
      logger.error('Diagram Analysis Error:', error);
      throw new Error('Failed to analyze diagram');
    }
  }

  async _logInteraction(sessionId, message, response) {
    logger.info('AI Interaction completed:', {
      sessionId,
      messageLength: message.length,
      responseLength: response.length
    });
  }

  async reviewSection(sessionId, sectionId, data) {
    try {
      const review = await this._generateReview(sectionId, data);
      
      // Track progress
      const progress = await progressTrackingService.trackSectionProgress(
        sessionId,
        sectionId,
        review
      );

      // Adjust feedback based on progress
      const adaptiveFeedback = this._adaptFeedbackToProgress(
        review.feedback,
        progress
      );

      return {
        ...review,
        progress,
        adaptiveFeedback
      };
    } catch (error) {
      logger.error('Review error:', error);
      throw error;
    }
  }

  _generateDiagramSuggestions(analysis) {
    return {
      improvements: analysis.patterns.missing,
      security: analysis.security,
      scalability: analysis.scalability,
      recommendations: analysis.recommendations
    };
  }

  _generateTextSuggestions(sectionId, content) {
    // Add section-specific suggestion logic here
    return {
      completeness: this._checkCompleteness(sectionId, content),
      clarity: this._checkClarity(content),
      recommendations: []
    };
  }

  _adaptFeedbackToProgress(feedback, progress) {
    // Adjust feedback based on improvement trend
    if (progress.improvement > 0) {
      return `Great improvement! ${feedback}`;
    } else if (progress.improvement < 0) {
      return `Let's focus on improving these areas: ${feedback}`;
    }
    return feedback;
  }
}

module.exports = { CoachingService };
