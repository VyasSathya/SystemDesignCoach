// server/services/engines/interviewEngine.js
const BaseEngine = require('./baseEngine');
const Interview = require('../../models/Interview');
const Problem = require('../../models/Problem');
const diagramUtils = require('../utils/diagramUtils');
const knowledgeService = require('../knowledge/knowledgeService');

const sessions = {};

class InterviewEngine extends BaseEngine {
  constructor(config = {}) {
    super(config);
    this.evaluationThreshold = config.evaluationThreshold || 0.8;
    this.diagramStageThreshold = config.diagramStageThreshold || 2;
  }
  
  async startInterview(userId, problemId, options = {}) {
    try {
      const problem = await Problem.findOne({ id: problemId });
      if (!problem) throw new Error('Problem not found');
      
      console.log(`Starting interview for user ${userId} with problem ${problemId}`);
      
      const context = await knowledgeService.queryKnowledge(`System design interview for ${problem.title}`, options.knowledgeSource || 'facebook');
      
      const systemPrompt = options.systemPrompt || `You are an expert system design interviewer.
Use the following context:
${context}
Guide the candidate through designing ${problem.title}. Ask probing questions and challenge assumptions.
Begin with a brief introduction.`;

      const initialResponse = await this.aiService.sendMessage([], {
        system: systemPrompt,
        temperature: options.temperature || 0.7
      });
      
      const interview = new Interview({
        userId,
        problemId,
        status: 'in_progress',
        currentStage: 'introduction',
        type: 'interview',
        startedAt: new Date(),
        timeLimit: problem.timeLimit || 45,
        conversation: [{
          role: 'interviewer',
          content: initialResponse || `Welcome to your system design interview. Today I'd like you to design ${problem.title}. We have about 45 minutes for this discussion. Could you start by telling me how you understand this problem and what key requirements we should consider?`,
          stage: 'introduction',
          timestamp: new Date().toISOString()
        }]
      });
      
      await interview.save();
      console.log(`Interview created with ID: ${interview._id}`);
      return interview;
    } catch (error) {
      console.error('Interview session start error:', error);
      throw error;
    }
  }
  
  async generateContent(sessionId, contentType, options = {}) {
    try {
      const interview = await Interview.findById(sessionId);
      if (!interview) throw new Error('Interview session not found');
      
      const problem = await Problem.findOne({ id: interview.problemId });
      const prompt = `Provide detailed feedback for the interview on ${problem.title}.`;
      
      const content = await this.aiService.generateContent(prompt, {
        system: "You are an experienced interviewer providing detailed feedback.",
        temperature: options.temperature || 0.6
      });
      
      return { type: 'feedback', content };
    } catch (error) {
      console.error('Generate content error in InterviewEngine:', error);
      throw error;
    }
  }
  
  async generateDiagram(sessionId, options = {}) {
    try {
      const interview = await Interview.findById(sessionId);
      if (!interview) throw new Error('Session not found');
      
      const problem = await Problem.findOne({ id: interview.problemId });
      const currentStage = options.stage || interview.currentStage || 'introduction';
      const entities = this._extractEntities(interview.conversation, currentStage);
      const diagramType = options.diagramType || diagramUtils.getDiagramTypeForStage(currentStage);
      const svgDiagram = diagramUtils.generateSvgDiagram(entities, diagramType, problem.title);
      
      return { diagram: svgDiagram, type: diagramType };
    } catch (error) {
      console.error('Error generating diagram in InterviewEngine:', error);
      return null;
    }
  }
  
  async processResponse(interviewId, message, options = {}) {
    console.log(`Processing interview message for interview ${interviewId}`);
    
    try {
      // Find the interview by ID - using findById instead of findOne with id
      const interview = await Interview.findById(interviewId);
      
      if (!interview) {
        console.error(`Interview not found with ID: ${interviewId}`);
        throw new Error('Interview not found');
      }
      
      console.log(`Found interview, current stage: ${interview.currentStage}`);
      
      // Add user message to conversation
      interview.conversation.push({
        role: 'candidate',
        content: message,
        stage: interview.currentStage,
        timestamp: new Date().toISOString()
      });
      
      // Prepare messages for AI
      const messagesForAI = interview.conversation.map(msg => ({
        role: msg.role === 'interviewer' ? 'assistant' : 
              msg.role === 'candidate' ? 'user' : msg.role,
        content: msg.content
      }));
      
      // Get problem context
      const problem = await Problem.findOne({ id: interview.problemId });
      if (!problem) {
        console.warn(`Problem not found for interview ${interviewId}`);
      }
      
      // Add system message with interview context
      const systemMessage = {
        role: 'system',
        content: `You are conducting a system design interview for ${problem?.title || 'a system design problem'}. 
The current stage is: ${interview.currentStage}.
Respond to the candidate's last message with thoughtful questions that probe their understanding.
Be conversational and react to what they've said, don't give generic responses.
If they ask about requirements, explore them thoroughly before moving to architecture.`
      };
      
      // Generate AI response
      console.log('Generating interviewer response...');
      const response = await this.aiService.sendMessage(
        [systemMessage, ...messagesForAI], 
        { 
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 800
        }
      );
      
      // Determine if we should advance to next stage
      const shouldAdvanceStage = this._shouldAdvanceStage(
        interview.conversation, 
        interview.currentStage, 
        messagesForAI.length
      );
      
      // Add interviewer response to conversation
      const responseMsg = {
        role: 'interviewer',
        content: response || "I'm interested in your approach. Could you elaborate on that further?",
        stage: interview.currentStage,
        timestamp: new Date().toISOString()
      };
      
      interview.conversation.push(responseMsg);
      
      // Update stage if needed
      if (shouldAdvanceStage) {
        interview.currentStage = this._getNextStage(interview.currentStage);
        console.log(`Advanced to stage: ${interview.currentStage}`);
      }
      
      // Save the updated interview
      await interview.save();
      console.log('Interview updated successfully');
      
      return interview;
    } catch (error) {
      console.error('Error processing interview message:', error);
      
      // Return fallback response
      return {
        conversation: [
          {
            role: 'interviewer',
            content: "I apologize, but I'm having trouble processing your response. Could you please explain your design approach again?",
            timestamp: new Date().toISOString(),
            error: true
          }
        ]
      };
    }
  }
  
  async finalizeInterview(interview) {
    try {
      if (!interview) throw new Error('Interview not found');
      
      if (interview.status === 'completed') {
        console.log('Interview already completed');
        return interview;
      }
      
      // Add final message if the interview was in progress
      if (interview.status === 'in_progress') {
        interview.conversation.push({
          role: 'interviewer',
          content: "Thank you for participating in this system design interview. I'll now provide you with feedback on your performance.",
          stage: interview.currentStage,
          timestamp: new Date().toISOString()
        });
        
        interview.status = 'completed';
        interview.completedAt = new Date();
      }
      
      // Prepare evaluation if not already done
      if (!interview.evaluation) {
        const problem = await Problem.findOne({ id: interview.problemId });
        
        // Extract the conversation for evaluation
        const conversationText = interview.conversation
          .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
          .join('\n\n');
        
        const systemPrompt = `You are an expert system design interviewer evaluating a candidate.
The problem was: ${problem?.title || 'a system design problem'}.
Provide a detailed evaluation with:
1. Overall score (0-100)
2. General feedback (2-3 paragraphs)
3. Key strengths (3-5 bullet points)
4. Areas for improvement (3-5 bullet points)
5. Specific advice for next steps`;
        
        // Generate evaluation
        const evaluationPrompt = `Based on this interview conversation, provide a detailed evaluation:\n\n${conversationText}`;
        
        const evaluationResponse = await this.aiService.sendMessage(
          [{role: 'system', content: systemPrompt}, {role: 'user', content: evaluationPrompt}],
          { temperature: 0.4, max_tokens: 1500 }
        );
        
        // Parse the evaluation
        try {
          // Extract score with regex (looking for a number from 0-100)
          const scoreMatch = evaluationResponse.match(/score:?\s*(\d{1,3})/i);
          const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 70;
          
          // Basic structure for evaluation
          interview.evaluation = {
            score: Math.min(100, Math.max(0, score)), // Ensure score is between 0-100
            feedback: evaluationResponse,
            strengths: [],
            weaknesses: [],
            areas_to_improve: []
          };
        } catch (parseError) {
          console.error('Error parsing evaluation:', parseError);
          interview.evaluation = {
            score: 70,
            feedback: evaluationResponse || "Evaluation could not be generated.",
            strengths: [],
            weaknesses: [], 
            areas_to_improve: []
          };
        }
      }
      
      await interview.save();
      return interview;
    } catch (error) {
      console.error('Error finalizing interview:', error);
      throw error;
    }
  }
  
  _extractEntities(messages, currentStage) {
    const userMessages = messages
      .filter(msg => msg.role === 'candidate' || msg.role === 'user')
      .map(msg => msg.content)
      .join('\n');
    
    const componentKeywords = [
      'server', 'database', 'cache', 'load balancer', 'api', 'client', 
      'service', 'queue', 'storage', 'frontend', 'backend', 'microservice'
    ];
    
    const entities = { 
      components: [], 
      relationships: [], 
      databases: [], 
      clients: [], 
      services: [] 
    };
    
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
    
    // Add default components based on stage
    if (entities.components.length === 0 && 
        entities.databases.length === 0 && 
        entities.services.length === 0) {
      
      // If we're past the introduction/requirements stage
      if (currentStage !== 'introduction' && currentStage !== 'requirements') {
        entities.clients.push({ name: 'Client', type: 'client' });
        entities.services.push({ name: 'API Service', type: 'service' });
      }
      
      // If we're in data modeling or later stages
      if (currentStage === 'data_modeling' || 
          currentStage === 'scalability' || 
          currentStage === 'conclusion') {
        entities.databases.push({ name: 'Database', type: 'database' });
      }
    }
    
    return entities;
  }
  
  _shouldAdvanceStage(conversation, currentStage, messageCount) {
    // Only advance stage after enough messages have been exchanged
    if (messageCount < 6) return false;
    
    // Map of stages to number of message pairs required before advancing
    const stageThresholds = {
      'introduction': 3,
      'requirements': 5,
      'architecture': 7,
      'data_modeling': 5,
      'scalability': 5,
      'conclusion': 999 // Never automatically advance past conclusion
    };
    
    const threshold = stageThresholds[currentStage] || 5;
    
    // Count pairs of messages (candidate -> interviewer)
    const relevantMessages = conversation.filter(
      msg => msg.stage === currentStage
    );
    
    const pairs = Math.floor(relevantMessages.length / 2);
    return pairs >= threshold;
  }
  
  _getNextStage(currentStage) {
    const stages = [
      'introduction',
      'requirements',
      'architecture',
      'data_modeling',
      'scalability',
      'conclusion'
    ];
    
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex === stages.length - 1) {
      return 'conclusion';
    }
    
    return stages[currentIndex + 1];
  }
}

module.exports = InterviewEngine;