// server/services/engines/coachEngine.js
const BaseEngine = require('./baseEngine');
const Interview = require('../../models/Interview');
const Problem = require('../../models/Problem');
const knowledgeService = require('../knowledge/knowledgeService');
const diagramUtils = require('../utils/diagramUtils');

const sessions = {};

class CoachEngine extends BaseEngine {
  constructor(config = {}) {
    super(config);
    this.stages = config.stages || [
      'introduction',
      'requirements',
      'architecture',
      'data-modeling',
      'scaling',
      'evaluation'
    ];
  }
  
  async processMessage(sessionId, message, options = {}) {
    console.log('⭐ CoachEngine processing message:', { sessionId, message });
    try {
      let session = null;
      try {
        session = await Interview.findOne({ id: sessionId });
      } catch (err) {
        console.log('DB error, falling back to in-memory session');
      }
      if (!session) {
        session = sessions[sessionId];
        if (!session) {
          console.log('Creating new in-memory session');
          session = { id: sessionId, conversation: [] };
          sessions[sessionId] = session;
        }
      }
      session.conversation.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });
      const messagesForAI = session.conversation.map(msg => ({
        role: msg.role === 'coach' ? 'assistant' : msg.role,
        content: msg.content
      }));
      const systemPrompt = options.systemPrompt || `You are a system design coach helping the user with their design problem.
Provide clear, educational guidance about system design concepts.
Do not just ask questions—provide specific knowledge and recommendations.
Explain concepts thoroughly with examples when appropriate.
Structure your responses to be easy to follow.`;
      const aiResponse = await this.aiService.sendMessage(messagesForAI, {
        system: systemPrompt,
        systemPrompt: systemPrompt,
        temperature: options.temperature || 0.7
      });
      const responseMsg = {
        role: 'coach',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };
      session.conversation.push(responseMsg);
      if (session.save) {
        await session.save();
      }
      return responseMsg;
    } catch (error) {
      console.error('Error processing coaching message:', error);
      return {
        role: 'coach',
        content: "I'm having trouble processing your request. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        error: true
      };
    }
  }
  
  async startSession(userId, problemId, options = {}) {
    try {
      const problem = await Problem.findOne({ id: problemId });
      if (!problem) throw new Error('Problem not found');
      const context = await knowledgeService.queryKnowledge(`System design concepts for ${problem.title}`, options.knowledgeSource || 'facebook');
      const systemPrompt = options.systemPrompt || `You are a supportive system design coach helping a student learn how to design ${problem.title}.
        
Use this context:
${context}

Your role is to:
1. Guide the student step by step.
2. Explain key concepts with examples.
3. Provide educational feedback.
4. Be supportive and technically accurate.

Start with an introduction to the problem, explaining why it's interesting and offering initial guidance.`;
      const initialResponse = await this.aiService.sendMessage([{
        role: "user",
        content: `I'd like to learn how to design ${problem.title}. Can you guide me through the process?`
      }], {
        system: systemPrompt,
        systemPrompt: systemPrompt,
        temperature: options.temperature || 0.7
      });
      const session = new Interview({
        userId,
        problemId,
        status: 'in_progress',
        currentStage: 'introduction',
        type: 'coaching',
        conversation: [{
          role: 'coach',
          content: initialResponse,
          timestamp: new Date().toISOString()
        }]
      });
      await session.save();
      return session;
    } catch (error) {
      console.error('Coaching session start error:', error);
      throw error;
    }
  }
  
  async generateContent(sessionId, topic, options = {}) {
    try {
      const session = await Interview.findOne({ id: sessionId });
      if (!session) throw new Error('Coaching session not found');
      const problem = await Problem.findOne({ id: session.problemId });
      switch (options.contentType || 'learning') {
        case 'learning':
          return this._generateLearningMaterials(session, topic, options);
        case 'diagram':
          return this._generateDiagramDescription(session, topic, options);
        default:
          throw new Error(`Unknown content type: ${options.contentType}`);
      }
    } catch (error) {
      console.error('Generate content error:', error);
      throw error;
    }
  }
  
  async _generateLearningMaterials(session, topic, options = {}) {
    try {
      const topicKnowledge = await knowledgeService.queryKnowledge(`${topic} ${session.problemId}`, options.knowledgeSource || 'facebook');
      const systemPrompt = `You are an educational content creator specializing in system design.
        
Generate detailed learning materials about "${topic}" as it relates to ${session.problemId}.

Reference:
${topicKnowledge}

Include clear explanations, examples, best practices, and common pitfalls.
Format as an educational guide with sections and key takeaways.`;
      const prompt = `I'd like to learn more about ${topic} for my system design project.`;
      const content = await this.aiService.generateContent(prompt, { 
        system: systemPrompt,
        systemPrompt: systemPrompt,
        temperature: options.temperature || 0.5
      });
      return { topic, content };
    } catch (error) {
      console.error('Generate learning materials error:', error);
      throw error;
    }
  }
  
  async _generateDiagramDescription(session, diagramType, options = {}) {
    try {
      const problem = await Problem.findOne({ id: session.problemId });
      const systemPrompt = `You are a system design visualization expert.
      
Generate a detailed description of a ${diagramType} diagram for ${problem.title}.
      
Describe each component, their relationships, and include visual cues.
This description will be used to generate an actual diagram.`;
      const prompt = `Please describe a ${diagramType} diagram for ${problem.title} that I could create.`;
      const description = await this.aiService.generateContent(prompt, { 
        system: systemPrompt,
        systemPrompt: systemPrompt,
        temperature: options.temperature || 0.5
      });
      return { diagramType, description };
    } catch (error) {
      console.error('Generate diagram description error:', error);
      throw error;
    }
  }
  
  _extractEntities(messages, currentStage) {
    const userMessages = messages.filter(msg => msg.role === 'user').map(msg => msg.content).join('\n');
    const componentKeywords = ['server', 'database', 'cache', 'load balancer', 'api', 'client', 'service', 'queue', 'storage', 'frontend', 'backend', 'microservice'];
    const entities = { components: [], relationships: [], databases: [], clients: [], services: [] };
    componentKeywords.forEach(keyword => {
      if (userMessages.toLowerCase().includes(keyword)) {
        const type = keyword.includes('database') ? 'databases'
          : (keyword.includes('client') || keyword.includes('frontend')) ? 'clients'
          : (keyword.includes('service') || keyword.includes('api') || keyword.includes('backend')) ? 'services'
          : 'components';
        entities[type].push({
          name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
          type: keyword
        });
      }
    });
    if (entities.components.length === 0 && entities.databases.length === 0 && entities.services.length === 0) {
      if (currentStage >= 2) {
        entities.clients.push({ name: 'Client', type: 'client' });
        entities.services.push({ name: 'API Service', type: 'service' });
      }
      if (currentStage >= 3) {
        entities.databases.push({ name: 'Database', type: 'database' });
      }
    }
    return entities;
  }
  
  _getCurrentStageIndex(stageName) {
    return this.stages.indexOf(stageName) !== -1 ? this.stages.indexOf(stageName) : 0;
  }
}

module.exports = CoachEngine;
