const PersonaManager = require('../persona/PersonaManager');
const WorkbookService = require('../workbook/WorkbookService');
const AIService = require('../ai/AIService');
const logger = require('../../utils/logger');

class CoachingEngine {
  constructor() {
    this.personaManager = PersonaManager;
    this.workbookService = WorkbookService;
    this.ai = new AIService();
    this.sessions = new Map();
  }

  async initialize() {
    await this.personaManager.initialize();
    await this.ai.initialize();
    logger.info('CoachingEngine initialized');
  }

  async startSession(userId, problemId) {
    try {
      const workbook = await this.workbookService.createWorkbook(userId, problemId);
      const sessionContext = {
        workbookId: workbook._id,
        currentStage: 'requirements',
        persona: 'coach',
        history: []
      };
      
      this.sessions.set(workbook.sessionId, sessionContext);
      return workbook.sessionId;
    } catch (error) {
      logger.error('Failed to start coaching session:', error);
      throw error;
    }
  }

  async processMessage(sessionId, message) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      const workbook = await this.workbookService.getWorkbook(session.workbookId);
      const persona = this.personaManager.setActivePersona(session.persona);
      
      const context = {
        stage: session.currentStage,
        workbookState: workbook.sections[session.currentStage],
        history: session.history
      };

      const response = await this.ai.generateResponse(message, {
        persona: persona.getPrompt(context),
        context: this.personaManager.getPersonaContext(session.persona, context)
      });

      // Update session history
      session.history.push({ role: 'user', content: message });
      session.history.push({ role: 'assistant', content: response });

      // Update workbook if needed
      if (response.workbookUpdates) {
        await this.workbookService.updateSection(
          workbook._id,
          session.currentStage,
          response.workbookUpdates
        );
      }

      return response;
    } catch (error) {
      logger.error('Error processing message:', error);
      throw error;
    }
  }

  async switchPersona(sessionId, newPersona) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.persona = newPersona;
    session.history = []; // Clear history when switching personas
    return true;
  }
}

module.exports = new CoachingEngine();
