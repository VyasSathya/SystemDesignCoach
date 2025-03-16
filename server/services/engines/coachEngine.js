// server/services/engines/coachEngine.js
const BaseEngine = require('./baseEngine');
const Interview = require('../../models/Interview');
const Problem = require('../../models/Problem');
const knowledgeService = require('../knowledge/knowledgeService');
const PersonaService = require('./PersonaService');
const path = require('path');

const coachPersona = require(path.join(__dirname, '../../../data/persona/coachPersona'));
const problems = require(path.join(__dirname, '../../../data/problems'));

const sessions = {};

class CoachEngine extends BaseEngine {
  constructor(config = {}) {
    super(config);
    // Stages can be passed dynamically or left empty
    this.stages = config.stages || [];
  }
  
  async processMessage(sessionId, message, options = {}) {
    const session = await Session.findById(sessionId);
    
    // Track learning patterns
    const learningPatterns = {
      vocabularyLevel: analyzeVocabularyLevel(message),
      conceptualUnderstanding: identifyConceptualLevel(message),
      communicationStyle: detectCommunicationStyle(message),
      lastTopics: session.recentTopics || []
    };

    // Update session with learning patterns
    session.learningPatterns = {
      ...session.learningPatterns,
      ...learningPatterns
    };

    // Include learning patterns in AI context
    const systemPrompt = this._buildSystemPrompt({
      ...options,
      learningPatterns: session.learningPatterns
    });

    try {
      console.log('💬 Processing message:', {
        sessionId,
        messageLength: message.length,
        options: JSON.stringify(options)
      });

      // Get problem context from persona
      const persona = require('../../data/persona/coachPersona');
      const problemConfig = persona.problems[sessionId];
      
      // Handle new user greeting
      if (message.toLowerCase().includes('new here')) {
        return {
          role: 'coach',
          content: `I understand you're new here! ${problemConfig?.description || 'This is a system design coaching session'}. I'll guide you through the process step by step. Let's start with understanding the basic requirements. What do you think should be the core features of our parking lot system?`,
          timestamp: new Date().toISOString()
        };
      }

      // Validate inputs
      if (!sessionId || !message) {
        console.error("Missing required parameters: sessionId or message");
        return {
          role: 'coach',
          content: "I need more information to help you. Could you try again?",
          timestamp: new Date().toISOString()
        };
      }
      
      // Retrieve or create session
      let session = await Interview.findOne({ id: sessionId });
      if (!session) {
        session = sessions[sessionId] || { id: sessionId, conversation: [] };
        sessions[sessionId] = session;
      }
      
      // Append user message to conversation history
      session.conversation.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });
      
      // Retrieve dynamic data from options
      const workbookContent = options.workbookContent || {};
      const currentSection = options.currentSection || '';
      const userLevel = options.userLevel || '';
      const currentPage = options.currentPage || '';
      
      // Get problem context dynamically from the database
      let problemContext = '';
      try {
        const problem = await Problem.findOne({ id: session.problemId });
        problemContext = problem
          ? `Project: ${problem.title}\nDescription: ${problem.description || ''}\nAdditional Info: ${problem.additionalInfo || ''}`
          : '';
      } catch (problemError) {
        console.warn("Error fetching problem:", problemError);
      }
      
      // Merge dynamic parts from Persona, problem, workbook, etc.
      const dynamicParts = [];
      
      // Try to get PersonaService system prompt
      try {
        const personaPrompt = PersonaService.getSystemPrompt({
          currentPage: options.currentPage,
          designData: { workbookContent, currentSection }
        });
        dynamicParts.push(personaPrompt);
      } catch (personaError) {
        console.warn("Error getting persona prompt:", personaError);
        dynamicParts.push("You are a System Design Coach helping with system architecture design.");
      }
      
      // Add other context parts
      if (problemContext) dynamicParts.push(problemContext);
      if (currentSection) dynamicParts.push(`Current Section: ${currentSection}`);
      if (Object.keys(workbookContent).length) dynamicParts.push(`Workbook Data: ${JSON.stringify(workbookContent)}`);
      if (userLevel) dynamicParts.push(`User Level: ${userLevel}`);

      const systemPrompt = dynamicParts.filter(Boolean).join("\n\n");
      
      // Debug: Log the final system prompt
      console.log("Final system prompt for processMessage:", systemPrompt);
      
      // Prepare conversation history for AI call
      const messagesForAI = session.conversation.map(msg => ({
        role: msg.role === 'coach' ? 'assistant' : msg.role,
        content: msg.content
      }));
      
      // Log conversation state
      console.log('📝 Conversation state:', {
        historyLength: session.conversation.length,
        lastMessages: session.conversation.slice(-2)
      });

      // Log AI call
      console.log('🤖 Calling AI with:', {
        messagesCount: messagesForAI.length,
        systemPromptLength: systemPrompt.length
      });

      // Call the AI service with dynamic prompt and full conversation history
      const aiResponse = await this.aiService.sendMessage(messagesForAI, {
        system: systemPrompt,
        systemPrompt: systemPrompt,
        temperature: options.temperature || 0.7,
        conciseMode: options.conciseMode
      });

      console.log('✨ AI Response received:', {
        length: aiResponse.length,
        preview: aiResponse.substring(0, 100)
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
        content: "I'm experiencing some technical difficulties processing your request. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        error: true
      };
    }
  }
  
  async startSession(userId, problemId, options = {}) {
    try {
      const problem = problems.find(p => p.id === problemId);
      if (!problem) {
        throw new Error('Problem not found');
      }

      const persona = coachPersona.problems[problemId];
      if (!persona) {
        throw new Error('Persona configuration not found for problem');
      }

      // Build dynamic problem context
      const problemContext = [
        `Project: ${problem.title}`,
        `Description: ${problem.description || ''}`,
        `Additional Info: ${problem.additionalInfo || ''}`
      ].filter(Boolean).join("\n");
      
      // Retrieve extra background info dynamically (if available)
      const contextInfo = await knowledgeService.queryKnowledge(
        `System design concepts for ${problem.title}`,
        options.knowledgeSource || ''
      );
      
      const dynamicParts = [
        PersonaService.getSystemPrompt({ currentPage: 'coach', designData: { project: problem.title } }),
        problemContext,
        contextInfo,
        options.userLevel ? `User Level: ${options.userLevel}` : ''
      ];
      let systemPrompt = dynamicParts.filter(Boolean).join("\n\n");
      
      // Append an instruction to begin the session
      systemPrompt += `\n\nBegin with an introduction to the project and initial guidance.`;
      
      console.log("Final system prompt for startSession:", systemPrompt);
      
      // Call the AI service for an initial response
      const initialResponse = await this.aiService.sendMessage(
        [{ role: 'user', content: `I need help designing a system for: ${problem.title}.` }],
        {
          system: systemPrompt,
          systemPrompt: systemPrompt,
          temperature: options.temperature || 0.7
        }
      );
      
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
      
      const topicKnowledge = await knowledgeService.queryKnowledge(
        `${topic} ${session.problemId}`,
        options.knowledgeSource || ''
      );
      
      const dynamicParts = [
        `You are an educational content creator specializing in system design.`,
        `Generate detailed learning materials about "${topic}" related to project ${problem ? problem.title : ''}.`,
        `Reference: ${topicKnowledge}`
      ];
      
      let systemPrompt = dynamicParts.filter(Boolean).join("\n\n");
      
      if (options.conciseMode !== false) {
        systemPrompt += `\n\nProvide a concise narrative that includes project context.`;
      }
      
      const prompt = `I'd like to learn more about ${topic} for my system design project.`;
      const content = await this.aiService.generateContent(prompt, { 
        system: systemPrompt,
        systemPrompt: systemPrompt,
        temperature: options.temperature || 0.5
      });
      
      return { topic, content, title: `Learning Materials: ${topic}` };
    } catch (error) {
      console.error('Generate learning materials error:', error);
      return {
        topic,
        title: `Learning Materials: ${topic}`,
        content: "Sorry, I'm having trouble generating learning materials at the moment. Please try again later."
      };
    }
  }
  
  async generateDiagram(sessionId, diagramType, options = {}) {
    try {
      const session = await Interview.findOne({ id: sessionId });
      if (!session) throw new Error('Coaching session not found');
      
      const problem = await Problem.findOne({ id: session.problemId });
      
      // Create a diagram prompt based on context
      const dynamicParts = [
        `You are a diagram generator for system design.`,
        `Create a ${diagramType} diagram for project: ${problem ? problem.title : 'system design'}.`,
        `Use mermaid syntax. Follow these guidelines:`,
        `- Keep the diagram simple and clear`,
        `- Focus on main components and relationships`,
        `- Use proper node types for each component`,
        `- Include all important connections`
      ];
      
      let systemPrompt = dynamicParts.filter(Boolean).join("\n\n");
      
      // Get diagram context
      const diagramPrompt = `Based on our conversation so far, create a ${diagramType} diagram for my system design.`;
      
      const diagramCode = await this.aiService.generateContent(diagramPrompt, {
        system: systemPrompt,
        systemPrompt: systemPrompt,
        temperature: 0.2  // Lower temperature for more consistent diagrams
      });
      
      // Extract mermaid code
      const mermaidPattern = /```mermaid\s*([\s\S]*?)\s*```/;
      const matches = diagramCode.match(mermaidPattern);
      const mermaidCode = matches ? matches[1].trim() : '';
      
      return {
        type: diagramType,
        mermaidCode: mermaidCode || this._getFallbackDiagram(diagramType),
        description: `${diagramType} diagram for ${problem ? problem.title : 'system design'}`
      };
    } catch (error) {
      console.error('Generate diagram error:', error);
      return {
        type: diagramType,
        mermaidCode: this._getFallbackDiagram(diagramType),
        description: 'Fallback diagram (error during generation)'
      };
    }
  }
  
  _getFallbackDiagram(type) {
    if (type === 'sequence') {
      return 'sequenceDiagram\n  Client->>API: Request\n  API->>Service: Process\n  Service->>Database: Query\n  Database-->>Service: Result\n  Service-->>API: Response\n  API-->>Client: Result';
    } else if (type === 'er') {
      return 'erDiagram\n  USER ||--o{ ORDER : places\n  ORDER ||--|{ LINE_ITEM : contains';
    } else {
      return 'graph TD\n  Client[Client] --> API[API Gateway]\n  API --> Service[Service]\n  Service --> DB[(Database)]';
    }
  }
  
  async evaluateDesign(sessionId, options = {}) {
    try {
      const session = await Interview.findOne({ id: sessionId });
      if (!session) throw new Error('Coaching session not found');
      
      const problem = await Problem.findOne({ id: session.problemId });
      
      // Create evaluation prompt
      const dynamicParts = [
        `You are a system design evaluator.`,
        `Evaluate the design for project: ${problem ? problem.title : 'system design'}.`,
        `Focus on these aspects:`,
        `- Requirements fulfillment`,
        `- Architecture quality`,
        `- Scalability approach`,
        `- Data model design`,
        `- Security considerations`
      ];
      
      let systemPrompt = dynamicParts.filter(Boolean).join("\n\n");
      
      // Get conversation context
      const conversationText = session.conversation
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n\n');
      
      const evaluationPrompt = `Please evaluate this system design discussion and provide feedback:
      
      ${conversationText}`;
      
      const evaluation = await this.aiService.generateContent(evaluationPrompt, {
        system: systemPrompt,
        systemPrompt: systemPrompt,
        temperature: 0.3  // Lower temperature for consistent evaluation
      });
      
      return {
        evaluation,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Evaluation error:', error);
      return {
        evaluation: "Unable to generate evaluation at this time.",
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new CoachEngine({
  provider: 'claude', // Default provider
  stages: [
    'introduction',
    'requirements',
    'architecture',
    'data-modeling',
    'scaling',
    'evaluation'
  ]
});