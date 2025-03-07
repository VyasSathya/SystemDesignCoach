// server/services/coaching/coachEngine.js
const { default: Anthropic } = require('@anthropic-ai/sdk');
const Interview = require('../../models/Interview');
const Problem = require('../../models/Problem');
const knowledgeService = require('../knowledge/knowledgeService');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const COACHING_STAGES = [
  'introduction', 'requirements', 'architecture', 
  'data-modeling', 'scaling', 'evaluation'
];

// Helper for extracting key points from AI responses
const _extractLearningPoints = (text, section) => {
  const regex = new RegExp(`${section}:\\s*(.+?)(?:\\n\\n|$)`, 'is');
  const match = text.match(regex);
  return match ? match[1].split('\n').map(p => p.trim()).filter(p => p) : [];
};

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
      
      session.conversation.push({
        role: 'student',
        content: message
      });
      
      const problem = await Problem.findOne({ id: session.problemId });
      
      // Get relevant knowledge based on the student's message and current stage
      const relevantKnowledge = await knowledgeService.queryKnowledge(
        `${message} ${session.currentStage} ${problem.title}`, 
        'facebook'
      );
      
      const formattedConversation = session.conversation
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role === 'coach' ? 'assistant' : 'user',
          content: msg.content
        }));
      
      const stageGuidance = {
        'introduction': 'Introduce the problem domain and key considerations',
        'requirements': 'Guide them through gathering functional and non-functional requirements',
        'architecture': 'Explain high-level system architecture concepts, components, and their interactions',
        'data-modeling': 'Teach about data storage options, schema design, and access patterns',
        'scaling': 'Explain techniques for horizontal and vertical scaling, caching, and load balancing',
        'evaluation': 'Guide on how to evaluate design choices and trade-offs'
      };

      // Generate educational response
      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        system: `You are a system design coach mentoring a student on ${problem.title}.
        
        Current learning stage: ${session.currentStage}
        Focus area: ${stageGuidance[session.currentStage]}
        
        Use this knowledge to provide educational content:
        ${relevantKnowledge}
        
        Your role is to:
        1. Explain concepts clearly with examples
        2. Provide specific educational content rather than just questions
        3. Guide the student's learning with scaffolded information
        4. Suggest diagrams or visualizations where helpful
        5. Respond in a supportive and detailed manner
        
        If the student has thoroughly understood the current stage concepts, 
        advance to the next stage with a clear transition.`,
        messages: formattedConversation,
        max_tokens: 1000,
        temperature: 0.7
      });

      // Add coach's response to conversation
      session.conversation.push({
        role: 'coach',
        content: response.content[0].text
      });
      
      // Check if we should advance to the next stage
      const shouldAdvance = response.content[0].text.toLowerCase().includes("let's move on to") || 
                            response.content[0].text.toLowerCase().includes("now that you understand") ||
                            response.content[0].text.toLowerCase().includes("let's proceed to");
                            
      if (shouldAdvance) {
        const currentStageIndex = COACHING_STAGES.indexOf(session.currentStage);
        if (currentStageIndex < COACHING_STAGES.length - 1) {
          session.currentStage = COACHING_STAGES[currentStageIndex + 1];
        }
      }
      
      await session.save();
      return session;
    } catch (error) {
      console.error('Coaching response error:', error);
      throw error;
    }
  },
  
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