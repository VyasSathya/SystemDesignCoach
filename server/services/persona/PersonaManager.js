const path = require('path');
const logger = require('../../utils/logger');

class PersonaManager {
  constructor() {
    this.personas = new Map();
    this.knowledgeBase = new Map();
    this.activePersona = null;
  }

  async initialize() {
    try {
      // Load persona definitions
      const personaTypes = ['coach', 'interviewer', 'grader'];
      for (const type of personaTypes) {
        const persona = require(`../../../data/persona/${type}Persona.js`);
        this.personas.set(type, persona);
      }

      // Load knowledge base
      await this.loadKnowledgeBase();

      logger.info('PersonaManager initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize PersonaManager:', error);
      throw error;
    }
  }

  async loadKnowledgeBase() {
    const baseDir = path.join(__dirname, '../../../data/knowledge_base');
    const companies = ['facebook', 'google', 'amazon'];
    
    for (const company of companies) {
      const companyData = {
        architecture: require(`${baseDir}/${company}/architecture/core_tech.md`),
        design: require(`${baseDir}/${company}/design_questions`),
        evaluation: require(`${baseDir}/${company}/evaluation_criteria/scoring_rubric.md`)
      };
      this.knowledgeBase.set(company, companyData);
    }
  }

  setActivePersona(type) {
    if (!this.personas.has(type)) {
      throw new Error(`Invalid persona type: ${type}`);
    }
    this.activePersona = this.personas.get(type);
    return this.activePersona;
  }

  getPersonaContext(type, additionalContext = {}) {
    const persona = this.personas.get(type);
    if (!persona) {
      throw new Error(`Persona not found: ${type}`);
    }

    return {
      ...persona.baseContext,
      ...additionalContext,
      knowledge: this.getRelevantKnowledge(additionalContext.topic)
    };
  }

  getRelevantKnowledge(topic) {
    // Implementation to fetch relevant knowledge based on topic
    return Array.from(this.knowledgeBase.values())
      .flatMap(company => Object.values(company))
      .filter(knowledge => knowledge.topics.includes(topic));
  }
}

module.exports = new PersonaManager();