// server/services/engines/PersonaService.js
class PersonaService {
  constructor() {
    this.personas = {};
    this.activePersonaId = 'coach'; // default active persona
    this.conciseMode = true; // default mode
  }
  
  initialize(config) {
    if (!config || !config.personas || !Array.isArray(config.personas)) {
      throw new Error('Invalid persona configuration');
    }
    
    config.personas.forEach(persona => {
      this.personas[persona.id] = persona;
    });
    
    // Validate that required personas exist
    ['coach', 'interviewer', 'grader'].forEach(requiredId => {
      if (!this.personas[requiredId]) {
        console.warn(`Required persona '${requiredId}' not found in configuration`);
      }
    });
    
    console.log(`Initialized ${Object.keys(this.personas).length} personas`);
    return this;
  }
  
  setActivePersona(personaId) {
    if (!this.personas[personaId]) {
      throw new Error(`Persona '${personaId}' not found`);
    }
    this.activePersonaId = personaId;
    return this.personas[personaId];
  }
  
  setConciseMode(enabled) {
    this.conciseMode = enabled;
    return this.conciseMode;
  }
  
  getActivePersona() {
    return this.personas[this.activePersonaId];
  }
  
  getPersona(personaId) {
    const persona = this.personas[personaId];
    if (!persona) {
      throw new Error(`Persona '${personaId}' not found`);
    }
    return persona;
  }
  
  getPageSuggestions(pageId) {
    const persona = this.getActivePersona();
    if (persona.pageSuggestions && persona.pageSuggestions[pageId]) {
      return persona.pageSuggestions[pageId];
    }
    return [];
  }
  
  getSystemPrompt(context = {}) {
    const persona = this.getActivePersona();
    let prompt = persona.systemPrompt || '';
    
    if (this.conciseMode) {
      prompt += `\n\nPlease provide a concise, narrative explanation that includes detailed project context when available. Avoid rigid bullet lists.`;
    } else {
      prompt += `\n\nPlease provide a detailed narrative explanation that covers all technical and project-specific details.`;
    }
    
    if (context.currentPage) {
      prompt += `\nSection: ${context.currentPage}`;
    }
    
    if (context.designData) {
      prompt += `\nProject Details: ${JSON.stringify(context.designData)}`;
    }
    
    return prompt;
  }
  
  formatResponse(patternKey, variables = {}) {
    const persona = this.getActivePersona();
    if (!persona.responsePatterns || !persona.responsePatterns[patternKey]) {
      return null;
    }
    
    let response = persona.responsePatterns[patternKey];
    Object.entries(variables).forEach(([key, value]) => {
      response = response.replace(`{${key}}`, value);
    });
    return response;
  }
  
  getAllPersonas() {
    return Object.values(this.personas).map(persona => ({
      id: persona.id,
      name: persona.name,
      role: persona.role,
      description: persona.description
    }));
  }
}

module.exports = new PersonaService();
