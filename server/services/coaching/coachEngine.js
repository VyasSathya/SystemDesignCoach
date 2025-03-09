// server/services/coaching/coachEngine.js
const { default: Anthropic } = require('@anthropic-ai/sdk');
const Interview = require('../../models/Interview');
const Problem = require('../../models/Problem');
const knowledgeService = require('../knowledge/knowledgeService');
const claudeService = require('../ai/claudeService');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "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",
});

const COACHING_STAGES = [
  'introduction', 'requirements', 'architecture', 
  'data-modeling', 'scaling', 'evaluation'
];

// In-memory session storage as fallback
const sessions = {};

// Helper for extracting key points from AI responses
const _extractLearningPoints = (text, section) => {
  const regex = new RegExp(`${section}:\\s*(.+?)(?:\\n\\n|$)`, 'is');
  const match = text.match(regex);
  return match ? match[1].split('\n').map(p => p.trim()).filter(p => p) : [];
};

/**
 * Process message for coaching session
 * @param {String} sessionId - Session ID 
 * @param {String} message - User's message
 * @returns {Promise<Object>} - AI response message
 */
async function handleMessage(sessionId, message) {
  console.log(`Processing message for session ${sessionId}`);
  
  try {
    // Get session from database or fallback to in-memory
    let session = null;
    try {
      session = await Interview.findById(sessionId);
    } catch (err) {
      console.log('Database error, falling back to in-memory session');
    }
    
    // Use in-memory session if not found in database
    if (!session) {
      session = sessions[sessionId];
      if (!session) {
        console.log('Creating new in-memory session');
        session = { id: sessionId, conversation: [] };
        sessions[sessionId] = session;
      }
    }
    
    // Add user message to conversation
    if (session.conversation) {
      session.conversation.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });
    } else {
      session.conversation = [{
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      }];
    }
    
    // Prepare messages for Claude
    const messages = session.conversation.map(msg => ({
      role: msg.role === 'coach' ? 'assistant' : msg.role,
      content: msg.content
    }));
    
    // Get response using the simplified sendMessage helper
    const claudeResponse = await claudeService.sendMessage(messages, {
      system: `You are a system design coach helping the user with their design problem. 
      Provide clear, educational guidance about system design concepts.
      Do not just ask questions - provide specific knowledge and recommendations.
      Explain concepts thoroughly with examples when appropriate.
      Structure your responses to be easy to follow.`
    });
    
    // Add assistant response to conversation
    const responseMsg = {
      role: 'coach',
      content: claudeResponse,
      timestamp: new Date().toISOString()
    };
    
    session.conversation.push(responseMsg);
    
    // Save if it's a database session
    if (session.save) {
      await session.save();
    }
    
    return responseMsg;
  } catch (error) {
    console.error('Error handling message:', error);
    return {
      role: 'coach',
      content: "I'm having trouble processing your request. Please try again in a moment.",
      timestamp: new Date().toISOString(),
      error: true
    };
  }
}

const coachEngine = {
  startCoachingSession: async (userId, problemId) => {
    try {
      const problem = await Problem.findOne({ id: problemId });
      if (!problem) {
        throw new Error('Problem not found');
      }
      
      // Get knowledge context for this problem
      const context = await knowledgeService.queryKnowledge(
        `System design concepts for ${problem.title}`, 
        'facebook'
      );
      
      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        system: `You are a supportive system design coach helping a student learn how to design ${problem.title}.
        
        Use this context about system design concepts:
        ${context}
        
        Your role is to:
        1. Guide the student through the design process step by step
        2. Explain key concepts thoroughly with examples
        3. Provide educational feedback that teaches best practices
        4. Be supportive and encouraging while being technically accurate
        
        Start with an introduction to the problem, explaining why it's interesting and offering some initial guidance on how to approach it. Use a friendly, educational tone.`,
        messages: [{
          role: "user", 
          content: `I'd like to learn how to design ${problem.title}. Can you guide me through the process?`
        }],
        max_tokens: 1000,
        temperature: 0.7
      });
      
      // Create and save coaching session (reusing Interview model for now)
      const session = new Interview({
        userId,
        problemId,
        status: 'in_progress',
        currentStage: 'introduction',
        type: 'coaching', // Mark this as a coaching session
        conversation: [
          {
            role: 'coach',
            content: response.content[0].text
          }
        ]
      });
      
      await session.save();
      return session;
    } catch (error) {
      console.error('Coaching session start error:', error);
      throw error;
    }
  },
  
  // This method handles messages for database-stored sessions
  processResponse: async (sessionId, message) => {
    try {
      const session = await Interview.findById(sessionId);
      if (!session) {
        throw new Error('Coaching session not found');
      }
      
      // Ensure this is a coaching session
      if (session.type !== 'coaching') {
        throw new Error('This is not a coaching session');
      }
      
      // Use the handleMessage function with the same session ID
      const response = await handleMessage(sessionId, message);
      
      return session;
    } catch (error) {
      console.error('Coaching response error:', error);
      throw error;
    }
  },
  
  // New method for handling messages in any session type
  handleMessage,
  
  generateLearningMaterials: async (sessionId, topic) => {
    try {
      const session = await Interview.findById(sessionId);
      if (!session) {
        throw new Error('Coaching session not found');
      }
      
      // Get in-depth content for the requested topic
      const topicKnowledge = await knowledgeService.queryKnowledge(
        `${topic} ${session.problemId}`, 
        'facebook'
      );
      
      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        system: `You are an educational content creator specializing in system design.
        
        Generate detailed learning materials about "${topic}" as it relates to ${session.problemId}.
        
        Use this reference information:
        ${topicKnowledge}
        
        Include:
        1. Clear explanations of concepts with examples
        2. Diagrams descriptions that would help illustrate the concepts
        3. Best practices and common pitfalls
        4. Industry-standard approaches
        
        Format as an educational guide with sections, examples, and key takeaways.`,
        messages: [{
          role: "user",
          content: `I'd like to learn more about ${topic} for my system design project.`
        }],
        max_tokens: 1500,
        temperature: 0.5
      });
      
      return {
        topic,
        content: response.content[0].text
      };
    } catch (error) {
      console.error('Generate learning materials error:', error);
      throw error;
    }
  },
  
  generateDiagramDescription: async (sessionId, diagramType) => {
    try {
      const session = await Interview.findById(sessionId);
      if (!session) {
        throw new Error('Coaching session not found');
      }
      
      const problem = await Problem.findOne({ id: session.problemId });
      
      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        system: `You are a system design visualization expert.
        
        Generate a detailed description of a ${diagramType} diagram for ${problem.title}.
        
        Your response should:
        1. Describe each component that should be in the diagram
        2. Explain the relationships between components
        3. Note important visual cues (colors, shapes, etc.)
        4. Provide a text-based representation of the diagram
        
        The output will be used to generate an actual diagram, so be specific about the components and their relationships.`,
        messages: [{
          role: "user",
          content: `Please describe a ${diagramType} diagram for ${problem.title} that I could create.`
        }],
        max_tokens: 1000,
        temperature: 0.5
      });
      
      return {
        diagramType,
        description: response.content[0].text
      };
    } catch (error) {
      console.error('Generate diagram description error:', error);
      throw error;
    }
  }
};

module.exports = coachEngine;
