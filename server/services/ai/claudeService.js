const { default: Anthropic } = require('@anthropic-ai/sdk');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});


/**
 * Simple message handler for direct conversations
 * @param {Array} messages - Previous messages in the conversation
 * @param {Object} options - Additional options like system prompt
 * @returns {Promise<String>} - AI response text
 */
async function sendMessage(messages, options = {}) {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      console.log(`Sending to Claude (attempt ${attempt + 1}):`, JSON.stringify(messages.slice(-3)));
      
      const formattedMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest',
        system: options.system || "You are a helpful system design coach.",
        messages: formattedMessages,
        max_tokens: 1000,
        temperature: 0.7,
      });
      
      console.log('Claude response received');
      return response.content[0].text;
    } catch (error) {
      attempt++;
      
      if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
        console.log(`Claude API timeout (attempt ${attempt}/${maxRetries})`);
        
        if (attempt < maxRetries) {
          // Wait 2 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 2000)); 
          continue;
        }
      }
      
      console.error('Claude API error:', error.response?.data || error.message);
      return "I'm having trouble connecting to my knowledge base. Let's try again in a moment.";
    }
  }
}

/**
 * Generate conversation response using Claude
 * @param {Array} messages - Previous messages in the conversation
 * @param {Object} problem - The problem definition
 * @param {Number} currentStage - Current stage in the design process
 * @returns {Promise<Object>} - AI response with content and progression info
 */
async function generateResponse(messages, problem, currentStage) {
  try {
    // Get the current stage prompt
    const stage = problem.promptSequence[currentStage];
    
    // Prepare conversation history for Claude
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Add system context if first message in current stage
    if (currentStage > 0 && !messages.some(m => m.metadata?.stage === currentStage)) {
      formattedMessages.push({
        role: 'assistant',
        content: `Let's move on to the next phase: **${stage.name}**\n\n${stage.prompt || stage.question}`
      });
    }
    
    // Create a system prompt with context about the problem and expectations
    const systemPrompt = `You are an expert system design interviewer helping the user design ${problem.title}.
Current design phase: ${stage.name}
Expected topics in this phase: ${stage.expectedTopics.join(', ')}

Your job is to:
1. Ask probing questions about the user's design
2. Point out potential issues or trade-offs
3. Guide them towards a complete solution without giving answers directly
4. Evaluate if they've covered the key aspects needed for this phase

Problem constraints:
${JSON.stringify(problem.constraints, null, 2)}

Respond in a conversational tone as if you're conducting an interview. Do not mention that you're an AI.
`;
    
    // Make API call to Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240229',
      system: systemPrompt,
      messages: formattedMessages,
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    // Extract the content from the response
    const aiMessage = response.content[0].text;
    
    // Determine if user should advance to next stage
    // This is a simplified logic - in production, you'd want more sophisticated evaluation
    const hasCompletedStage = evaluateStageCompletion(aiMessage, stage.expectedTopics);
    const advanceStage = hasCompletedStage && (currentStage < problem.promptSequence.length - 1);
    
    return {
      message: aiMessage,
      advanceStage,
      updateDiagram: shouldUpdateDiagram(currentStage, aiMessage),
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response');
  }
}

/**
 * Determine if the current stage is complete based on the AI response
 * @param {String} aiMessage - The AI's response message
 * @param {Array} expectedTopics - Topics that should be covered in this phase
 * @returns {Boolean} - Whether the stage is complete
 */
function evaluateStageCompletion(aiMessage, expectedTopics) {
  // Count how many expected topics are mentioned in the AI's message
  const topicsMentioned = expectedTopics.filter(topic => 
    aiMessage.toLowerCase().includes(topic.toLowerCase())
  );
  
  // If more than 80% of topics are addressed AND message contains positive feedback
  const positiveLanguage = [
    "great job", "well done", "good work", "excellent", "comprehensive",
    "covered all", "addressed all", "complete", "ready to move on"
  ];
  
  const hasPositiveLanguage = positiveLanguage.some(phrase => 
    aiMessage.toLowerCase().includes(phrase)
  );
  
  return (topicsMentioned.length / expectedTopics.length >= 0.8) && hasPositiveLanguage;
}

/**
 * Determine if we should update the diagram based on stage and message content
 * @param {Number} currentStage - Current stage in the design process
 * @param {String} aiMessage - The AI's response message
 * @returns {Boolean} - Whether to update the diagram
 */
function shouldUpdateDiagram(currentStage, aiMessage) {
  // Only update diagrams after API design stage (stage 2)
  if (currentStage < 2) return false;
  
  // Update if the message mentions diagrams or visualization
  const diagramKeywords = [
    "diagram", "architecture", "design", "flow", "structure",
    "layout", "system", "components", "visualization"
  ];
  
  return diagramKeywords.some(keyword => 
    aiMessage.toLowerCase().includes(keyword)
  );
}

/**
 * Generate a system design diagram based on conversation
 * @param {Array} messages - Conversation history
 * @param {Object} problem - Problem definition
 * @param {Number} currentStage - Current design stage
 * @returns {Promise<String>} - SVG diagram markup
 */
async function generateDiagram(messages, problem, currentStage) {
  try {
    // Extract key components and their relationships from conversation
    const entities = extractEntities(messages, currentStage);
    
    // Generate SVG diagram based on extracted entities
    const diagramType = getDiagramTypeForStage(currentStage);
    const svgDiagram = generateSvgDiagram(entities, diagramType, problem.title);
    
    return svgDiagram;
  } catch (error) {
    console.error('Error generating diagram:', error);
    return null;
  }
}

/**
 * Extract system components and relationships from conversation
 * @param {Array} messages - Conversation history
 * @param {Number} currentStage - Current design stage
 * @returns {Object} - Extracted entities and relationships
 */
function extractEntities(messages, currentStage) {
  // This is a simplified implementation - a production version would:
  // 1. Use Claude to extract entities and relationships
  // 2. Parse the user's text to identify components, databases, services, etc.
  // 3. Track relationships between these components
  
  const userMessages = messages
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content)
    .join('\n');
  
  // Simple keyword extraction (this would be much more sophisticated in production)
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
  
  // Very simple entity extraction (would be replaced with AI-based extraction)
  componentKeywords.forEach(keyword => {
    if (userMessages.toLowerCase().includes(keyword)) {
      const type = keyword.includes('database') ? 'databases' :
                  keyword.includes('client') || keyword.includes('frontend') ? 'clients' :
                  keyword.includes('service') || keyword.includes('api') || keyword.includes('backend') ? 'services' :
                  'components';
      
      entities[type].push({
        name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
        type: keyword
      });
    }
  });
  
  // Add some default components based on stage if none extracted
  if (entities.components.length === 0 && 
      entities.databases.length === 0 && 
      entities.services.length === 0) {
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

/**
 * Determine which type of diagram to generate based on the current stage
 * @param {Number} currentStage - Current design stage
 * @returns {String} - Diagram type (architecture, er, sequence)
 */
function getDiagramTypeForStage(currentStage) {
  // Map stages to diagram types
  const stageToType = {
    0: null, // Requirements - no diagram
    1: null, // Scale estimation - no diagram
    2: 'api', // API design - API diagram
    3: 'er', // Data model - ER diagram
    4: 'architecture', // System architecture
    5: 'architecture' // Optimization - enhanced architecture
  };
  
  return stageToType[currentStage] || 'architecture';
}

/**
 * Generate an SVG diagram based on extracted entities
 * @param {Object} entities - Extracted components and relationships
 * @param {String} diagramType - Type of diagram to generate
 * @param {String} title - Diagram title
 * @returns {String} - SVG markup
 */
function generateSvgDiagram(entities, diagramType, title) {
  if (diagramType === 'er') {
    return generateErDiagram(entities, title);
  } else if (diagramType === 'api') {
    return generateApiDiagram(entities, title);
  } else {
    return generateArchitectureDiagram(entities, title);
  }
}

/**
 * Generate an architecture diagram as SVG
 * @param {Object} entities - Extracted components and relationships
 * @param {String} title - Diagram title
 * @returns {String} - SVG markup
 */
function generateArchitectureDiagram(entities, title) {
  // Create an architecture diagram with clients, services, and databases
  const svgWidth = 800;
  const svgHeight = 600;
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="100%">
    <!-- Background -->
    <rect width="${svgWidth}" height="${svgHeight}" fill="#f8f9fa" rx="10" ry="10"/>
    
    <!-- Title -->
    <text x="${svgWidth/2}" y="40" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="#333">${title}</text>
    <text x="${svgWidth/2}" y="65" font-family="Arial" font-size="14" text-anchor="middle" fill="#666">System Architecture</text>
    
    <!-- Layers -->
    <rect x="50" y="100" width="${svgWidth-100}" height="80" fill="#e3f2fd" stroke="#2196f3" stroke-width="2" rx="5" ry="5" opacity="0.5"/>
    <text x="${svgWidth/2}" y="125" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="#0d47a1">Client Layer</text>
    
    <rect x="50" y="200" width="${svgWidth-100}" height="80" fill="#e8f5e9" stroke="#4caf50" stroke-width="2" rx="5" ry="5" opacity="0.5"/>
    <text x="${svgWidth/2}" y="225" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="#1b5e20">API Layer</text>
    
    <rect x="50" y="300" width="${svgWidth-100}" height="80" fill="#fff3e0" stroke="#ff9800" stroke-width="2" rx="5" ry="5" opacity="0.5"/>
    <text x="${svgWidth/2}" y="325" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="#e65100">Service Layer</text>
    
    <rect x="50" y="400" width="${svgWidth-100}" height="80" fill="#e0f7fa" stroke="#00bcd4" stroke-width="2" rx="5" ry="5" opacity="0.5"/>
    <text x="${svgWidth/2}" y="425" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="#006064">Data Layer</text>
  `;
  
  // Add clients to client layer
  const clients = entities.clients.length > 0 ? entities.clients : [{ name: 'Client Application', type: 'client' }];
  const clientWidth = Math.min(120, (svgWidth - 150) / clients.length);
  clients.forEach((client, index) => {
    const x = 100 + index * (clientWidth + 30);
    svg += `
      <rect x="${x}" y="115" width="${clientWidth}" height="50" fill="#bbdefb" stroke="#1976d2" stroke-width="2" rx="5" ry="5"/>
      <text x="${x + clientWidth/2}" y="145" font-family="Arial" font-size="14" text-anchor="middle" fill="#0d47a1">${client.name}</text>
    `;
  });
  
  // Add load balancer if present
  if (entities.components.some(c => c.type.includes('load balancer'))) {
    svg += `
      <path d="M370,215 L440,215 L470,245 L440,275 L370,275 L340,245 Z" fill="#c8e6c9" stroke="#388e3c" stroke-width="2"/>
      <text x="405" y="250" font-family="Arial" font-size="14" text-anchor="middle" fill="#1b5e20">Load Balancer</text>
    `;
  }
  
  // Add services to service layer
  const services = entities.services.length > 0 ? entities.services : [{ name: 'API Service', type: 'service' }];
  const serviceWidth = Math.min(120, (svgWidth - 150) / services.length);
  services.forEach((service, index) => {
    const x = 100 + index * (serviceWidth + 30);
    svg += `
      <rect x="${x}" y="315" width="${serviceWidth}" height="50" fill="#ffe0b2" stroke="#f57c00" stroke-width="2" rx="5" ry="5"/>
      <text x="${x + serviceWidth/2}" y="345" font-family="Arial" font-size="14" text-anchor="middle" fill="#e65100">${service.name}</text>
    `;
  });
  
  // Add databases to data layer
  const databases = entities.databases.length > 0 ? entities.databases : [{ name: 'Database', type: 'database' }];
  databases.forEach((db, index) => {
    const x = 150 + index * 200;
    svg += `
      <path d="M${x-60},430 L${x+60},430 L${x+60},450 C${x+60},470 ${x},485 ${x-60},485 L${x-60},430 Z" fill="#b2ebf2" stroke="#0097a7" stroke-width="2"/>
      <ellipse cx="${x}" cy="430" rx="60" ry="15" fill="#b2ebf2" stroke="#0097a7" stroke-width="2"/>
      <text x="${x}" y="460" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle" fill="#006064">${db.name}</text>
    `;
  });
  
  // Add cache if present
  if (entities.components.some(c => c.type.includes('cache'))) {
    svg += `
      <rect x="600" y="430" width="120" height="50" fill="#b2ebf2" stroke="#0097a7" stroke-width="2" rx="5" ry="5"/>
      <text x="660" y="460" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle" fill="#006064">Cache</text>
    `;
  }
  
  // Add connections between layers
  svg += `
    <!-- Client to API connections -->
    <line x1="160" y1="165" x2="160" y2="215" stroke="#757575" stroke-width="2" stroke-dasharray="5,5"/>
    <line x1="400" y1="165" x2="400" y2="215" stroke="#757575" stroke-width="2" stroke-dasharray="5,5"/>
    
    <!-- API to Service connections -->
    <line x1="160" y1="275" x2="160" y2="315" stroke="#757575" stroke-width="2"/>
    <line x1="400" y1="275" x2="400" y2="315" stroke="#757575" stroke-width="2"/>
    
    <!-- Service to Database connections -->
    <line x1="160" y1="365" x2="160" y2="430" stroke="#757575" stroke-width="2"/>
    <line x1="400" y1="365" x2="400" y2="430" stroke="#757575" stroke-width="2"/>
  `;
  
  svg += `</svg>`;
  return svg;
}

/**
 * Generate an ER diagram as SVG for data model
 * @param {Object} entities - Extracted entities and attributes
 * @param {String} title - Diagram title
 * @returns {String} - SVG markup
 */
function generateErDiagram(entities, title) {
  // Create a simple ER diagram with primary database entities
  const svgWidth = 800;
  const svgHeight = 600;
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="100%">
    <!-- Background -->
    <rect width="${svgWidth}" height="${svgHeight}" fill="#f8f9fa" rx="10" ry="10"/>
    
    <!-- Title -->
    <text x="${svgWidth/2}" y="40" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="#333">${title}</text>
    <text x="${svgWidth/2}" y="65" font-family="Arial" font-size="14" text-anchor="middle" fill="#666">Entity Relationship Diagram</text>
  `;
  
  // Use databases or create default entities if none exist
  const dbEntities = entities.databases.length > 0 ? 
    entities.databases : 
    [
      { name: 'User', type: 'entity', attributes: ['id', 'name', 'email'] },
      { name: 'Profile', type: 'entity', attributes: ['id', 'user_id', 'bio'] }
    ];
  
  // Add entities to the diagram
  dbEntities.forEach((entity, index) => {
    const x = 150 + (index % 3) * 250;
    const y = 150 + Math.floor(index / 3) * 200;
    
    // Add attributes if they exist or create defaults
    const attributes = entity.attributes || ['id', 'created_at', 'updated_at'];
    
    // Entity header
    svg += `
      <rect x="${x-100}" y="${y}" width="200" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2" rx="5" ry="5"/>
      <text x="${x}" y="${y+25}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="#0d47a1">${entity.name}</text>
      
      <!-- Entity attributes -->
      <rect x="${x-100}" y="${y+40}" width="200" height="${attributes.length * 25}" fill="#f5f5f5" stroke="#1976d2" stroke-width="2" rx="0" ry="0"/>
    `;
    
    // Add each attribute
    attributes.forEach((attr, attrIndex) => {
      svg += `
        <text x="${x-90}" y="${y+65+attrIndex*25}" font-family="Arial" font-size="14" text-anchor="start" fill="#333">${attr}</text>
      `;
    });
    
    // Add relationships if there are multiple entities
    if (index > 0 && index < dbEntities.length) {
      const prevX = 150 + ((index-1) % 3) * 250;
      const prevY = 150 + Math.floor((index-1) / 3) * 200;
      
      // Only connect horizontally adjacent entities
      if (Math.floor(index / 3) === Math.floor((index-1) / 3)) {
        svg += `
          <line x1="${prevX+100}" y1="${prevY+60}" x2="${x-100}" y2="${y+60}" stroke="#757575" stroke-width="2" marker-end="url(#arrowhead)"/>
        `;
      }
    }
  });
  
  // Add arrow marker
  svg += `
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#757575" />
      </marker>
    </defs>
  `;
  
  svg += `</svg>`;
  return svg;
}

/**
 * Generate an API diagram as SVG
 * @param {Object} entities - Extracted entities
 * @param {String} title - Diagram title
 * @returns {String} - SVG markup
 */
function generateApiDiagram(entities, title) {
  // Create a simple API endpoint visualization
  const svgWidth = 800;
  const svgHeight = 600;
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="100%">
    <!-- Background -->
    <rect width="${svgWidth}" height="${svgHeight}" fill="#f8f9fa" rx="10" ry="10"/>
    
    <!-- Title -->
    <text x="${svgWidth/2}" y="40" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="#333">${title}</text>
    <text x="${svgWidth/2}" y="65" font-family="Arial" font-size="14" text-anchor="middle" fill="#666">API Design</text>
    
    <!-- API Endpoints Box -->
    <rect x="50" y="100" width="${svgWidth-100}" height="${svgHeight-150}" fill="#ffffff" stroke="#2196f3" stroke-width="2" rx="5" ry="5"/>
    <text x="${svgWidth/2}" y="130" font-family="Arial" font-size="18" font-weight="bold" text-anchor="middle" fill="#0d47a1">API Endpoints</text>
  `;
  
  // Create default API endpoints based on the problem domain
  const endpoints = [
    { method: 'GET', path: '/api/resource', description: 'Get all resources' },
    { method: 'GET', path: '/api/resource/{id}', description: 'Get resource by ID' },
    { method: 'POST', path: '/api/resource', description: 'Create new resource' },
    { method: 'PUT', path: '/api/resource/{id}', description: 'Update resource' },
    { method: 'DELETE', path: '/api/resource/{id}', description: 'Delete resource' }
  ];
  
  // Draw each endpoint
  endpoints.forEach((endpoint, index) => {
    const y = 180 + index * 70;
    
    // Method box
    const methodColor = endpoint.method === 'GET' ? '#4caf50' :
                        endpoint.method === 'POST' ? '#2196f3' :
                        endpoint.method === 'PUT' ? '#ff9800' :
                        endpoint.method === 'DELETE' ? '#f44336' : '#9c27b0';
    
    svg += `
      <rect x="100" y="${y}" width="100" height="40" fill="${methodColor}" stroke="none" rx="5" ry="5"/>
      <text x="150" y="${y+25}" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="white">${endpoint.method}</text>
      
      <!-- Path -->
      <rect x="200" y="${y}" width="300" height="40" fill="#f5f5f5" stroke="none" rx="0" ry="0"/>
      <text x="210" y="${y+25}" font-family="monospace" font-size="14" text-anchor="start" fill="#333">${endpoint.path}</text>
      
      <!-- Description -->
      <text x="520" y="${y+25}" font-family="Arial" font-size="14" text-anchor="start" fill="#555">${endpoint.description}</text>
    `;
  });
  
  svg += `</svg>`;
  return svg;
}

module.exports = {
  generateResponse,
  generateDiagram,
  sendMessage
};
