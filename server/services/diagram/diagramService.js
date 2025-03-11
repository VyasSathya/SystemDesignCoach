// server/services/diagram/diagramService.js
const Interview = require('../../models/Interview');
const Problem = require('../../models/Problem');
const AIFactory = require('../ai/aiFactory');
const aiConfig = require('../../config/aiConfig');

// Create AI service from factory using configuration
const aiService = AIFactory.createService(
  aiConfig.defaultProvider, 
  aiConfig[aiConfig.defaultProvider]
);

// Supported diagram types
const DIAGRAM_TYPES = {
  ARCHITECTURE: 'architecture',
  ER: 'entity-relationship',
  SEQUENCE: 'sequence',
  API: 'api',
  COMPONENT: 'component',
  FLOW: 'flow'
};

/**
 * Extract Mermaid code from Claude's response
 * @param {string} text - The text containing Mermaid code
 * @returns {string} - Extracted Mermaid code
 */
function extractMermaidCode(text) {
  // Look for Mermaid code between triple backticks
  const mermaidRegex = /```mermaid\s*([\s\S]*?)\s*```/;
  const match = text.match(mermaidRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // Fallback - try to find anything that looks like a diagram
  const fallbackRegex = /(?:flowchart|sequenceDiagram|classDiagram|erDiagram|gantt|pie|graph)[\s\S]*?;/g;
  const fallbackMatch = text.match(fallbackRegex);
  
  if (fallbackMatch) {
    return fallbackMatch.join('\n');
  }
  
  // Return a default diagram if no valid code found
  return `graph TD
    Client[Client] --> API[API Gateway]
    API --> Service[Service]
    Service --> DB[(Database)]`;
}

/**
 * Create an appropriate system prompt based on diagram type
 * @param {string} diagramType - Type of diagram to generate
 * @param {string} title - Title of the diagram
 * @param {string} customPrompt - Optional custom prompt
 * @returns {string} - System prompt for Claude
 */
function getPromptForDiagramType(diagramType, title, customPrompt) {
  if (customPrompt) {
    return `You are an expert system designer tasked with creating a diagram. 
    ${customPrompt}
    
    IMPORTANT: You must respond ONLY with a Mermaid diagram. No introduction, explanation, or conclusion.
    Use the Mermaid syntax and format your response as follows:
    
    \`\`\`mermaid
    // Your diagram code here
    \`\`\`
    
    Make the diagram comprehensive but clean and well-organized.`;
  }
  
  const prompts = {
    [DIAGRAM_TYPES.ARCHITECTURE]: `You are an expert system architect tasked with creating an architecture diagram.
    Create a clean, well-organized architecture diagram for: "${title}"
    
    IMPORTANT: You must respond ONLY with a Mermaid flowchart diagram.
    Use the Mermaid syntax and format your response as follows:
    
    \`\`\`mermaid
    flowchart TD
      // Your diagram code here
    \`\`\`
    
    Include all key components like:
    - Client/User interfaces
    - Load balancers
    - API layers
    - Service components
    - Databases
    - Caching systems
    - External dependencies
    
    Use appropriate styling and grouping to make the diagram clear.`,
    
    [DIAGRAM_TYPES.ER]: `You are a database expert tasked with creating an entity-relationship diagram.
    Create a clean, well-organized ER diagram for: "${title}"
    
    IMPORTANT: You must respond ONLY with a Mermaid ER diagram.
    Use the Mermaid syntax and format your response as follows:
    
    \`\`\`mermaid
    erDiagram
      // Your diagram code here
    \`\`\`
    
    Include:
    - All entities with appropriate attributes
    - Relationship types (one-to-many, many-to-many, etc.)
    - Primary and foreign keys 
    
    Make the diagram comprehensive but clean and well-organized.`,
    
    [DIAGRAM_TYPES.SEQUENCE]: `You are a system designer tasked with creating a sequence diagram.
    Create a clean, well-organized sequence diagram for: "${title}"
    
    IMPORTANT: You must respond ONLY with a Mermaid sequence diagram.
    Use the Mermaid syntax and format your response as follows:
    
    \`\`\`mermaid
    sequenceDiagram
      // Your diagram code here
    \`\`\`
    
    Include:
    - All important actors and systems
    - Clear sequence of operations
    - Request and response flows
    - Error handling if relevant
    
    Make the diagram focused on the key interactions without unnecessary detail.`,
    
    [DIAGRAM_TYPES.API]: `You are an API designer tasked with creating an API flow diagram.
    Create a clean, well-organized API diagram for: "${title}"
    
    IMPORTANT: You must respond ONLY with a Mermaid flowchart diagram.
    Use the Mermaid syntax and format your response as follows:
    
    \`\`\`mermaid
    flowchart LR
      // Your diagram code here
    \`\`\`
    
    Include:
    - API endpoints
    - Request/response flows
    - Data models
    - Authentication flows if relevant
    
    Use appropriate styling and organization to make the API structure clear.`,
    
    [DIAGRAM_TYPES.COMPONENT]: `You are a software architect tasked with creating a component diagram.
    Create a clean, well-organized component diagram for: "${title}"
    
    IMPORTANT: You must respond ONLY with a Mermaid flowchart diagram.
    Use the Mermaid syntax and format your response as follows:
    
    \`\`\`mermaid
    flowchart TD
      // Your diagram code here
    \`\`\`
    
    Include:
    - Major software components
    - Component dependencies
    - Interfaces between components
    - Key responsibilities of each component
    
    Focus on modularity and clear dependencies.`,
    
    [DIAGRAM_TYPES.FLOW]: `You are a process designer tasked with creating a flow diagram.
    Create a clean, well-organized flow diagram for: "${title}"
    
    IMPORTANT: You must respond ONLY with a Mermaid flowchart diagram.
    Use the Mermaid syntax and format your response as follows:
    
    \`\`\`mermaid
    flowchart TD
      // Your diagram code here
    \`\`\`
    
    Include:
    - Clear start and end points
    - Decision points with conditions
    - Process steps
    - Key outcomes
    
    Focus on making the flow easy to follow and understand.`
  };
  
  return prompts[diagramType] || prompts[DIAGRAM_TYPES.ARCHITECTURE];
}

const diagramService = {
  TYPES: DIAGRAM_TYPES,
  
  /**
   * Generate diagram from conversation
   * @param {String} sessionId - ID of the interview or coaching session
   * @param {String} diagramType - Type of diagram to generate
   * @param {String} customPrompt - Optional custom request for diagram
   * @returns {Promise<Object>} - Diagram data including Mermaid code
   */
  generateDiagram: async (sessionId, diagramType, customPrompt = null) => {
    try {
      console.log(`Generating ${diagramType} diagram for session ${sessionId}`);
      
      // Find the session
      const session = await Interview.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      
      // Find associated problem
      const problem = await Problem.findOne({ id: session.problemId });
      if (!problem) {
        throw new Error('Problem not found');
      }
      
      // Extract relevant conversation content
      const sessionContent = session.conversation
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n\n');
      
      // Add user input if provided
      const userContext = customPrompt ? `\nAdditional requirements: ${customPrompt}` : '';
      
      // Generate Mermaid code using shared AI service
      const prompt = `Here is a conversation about designing ${problem.title}:
          
      ${sessionContent}
      ${userContext}
      
      Based on this conversation, create a Mermaid diagram that captures the key components and relationships.`;
      
      const response = await aiService.generateContent(prompt, {
        system: getPromptForDiagramType(diagramType, problem.title, customPrompt),
        temperature: 0.2,
        maxTokens: 1500
      });
      
      // Extract Mermaid code from response
      const mermaidCode = extractMermaidCode(response);
      
      return {
        mermaidCode,
        type: diagramType,
        description: `${diagramType.replace(/-/g, ' ')} diagram for ${problem.title}`,
        sessionId,
        problemId: problem.id,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error generating diagram:', error);
      
      // Return a default diagram on error
      return {
        mermaidCode: `graph TD
          Client[Client] --> API[API Gateway]
          API --> Service[Service]
          Service --> DB[(Database)]`,
        type: diagramType,
        description: `Default ${diagramType} diagram (error during generation)`,
        sessionId,
        problemId: 'unknown',
        error: error.message
      };
    }
  },
  
  /**
   * Get available diagram types
   * @returns {Object} - Available diagram types
   */
  getDiagramTypes: () => DIAGRAM_TYPES
};

module.exports = diagramService;