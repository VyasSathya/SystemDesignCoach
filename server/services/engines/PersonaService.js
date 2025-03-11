// PersonaService.js
// Manages loading, retrieving, and switching between agent personas

class PersonaService {
    constructor() {
      this.personas = {};
      this.activePersonaId = 'coach'; // Default persona
    }
  
    /**
     * Initialize service by loading personas from configuration
     * @param {Object} config - Persona configuration object
     */
    initialize(config) {
      if (!config || !config.personas || !Array.isArray(config.personas)) {
        throw new Error('Invalid persona configuration');
      }
  
      // Index personas by ID for easy access
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
  
    /**
     * Set the active persona
     * @param {string} personaId - ID of the persona to activate
     */
    setActivePersona(personaId) {
      if (!this.personas[personaId]) {
        throw new Error(`Persona '${personaId}' not found`);
      }
      this.activePersonaId = personaId;
      return this.personas[personaId];
    }
  
    /**
     * Get the active persona
     * @returns {Object} Current active persona
     */
    getActivePersona() {
      return this.personas[this.activePersonaId];
    }
  
    /**
     * Get a specific persona by ID
     * @param {string} personaId - ID of the persona to retrieve
     * @returns {Object} Requested persona
     */
    getPersona(personaId) {
      const persona = this.personas[personaId];
      if (!persona) {
        throw new Error(`Persona '${personaId}' not found`);
      }
      return persona;
    }
  
    /**
     * Get suggestions for the current page from active persona
     * @param {string} pageId - ID of the current page
     * @returns {Array} List of suggested questions for this page
     */
    getPageSuggestions(pageId) {
      const persona = this.getActivePersona();
      if (persona.pageSuggestions && persona.pageSuggestions[pageId]) {
        return persona.pageSuggestions[pageId];
      }
      return [];
    }
  
    /**
     * Get the system prompt for the active persona
     * @param {Object} context - Additional context to include in prompt
     * @returns {string} Formatted system prompt
     */
    getSystemPrompt(context = {}) {
      const persona = this.getActivePersona();
      let prompt = persona.systemPrompt || '';
  
      // Add page-specific context if available
      if (context.currentPage && persona.pageSuggestions) {
        prompt += `\nThe user is currently working on the ${context.currentPage} section.`;
      }
  
      // Add design-specific context if available
      if (context.designData) {
        prompt += `\nCurrent design information: ${JSON.stringify(context.designData)}`;
      }
  
      return prompt;
    }
  
    /**
     * Format a response using persona patterns
     * @param {string} patternKey - Which response pattern to use
     * @param {Object} variables - Variables to inject into template 
     * @returns {string} Formatted response
     */
    formatResponse(patternKey, variables = {}) {
      const persona = this.getActivePersona();
      if (!persona.responsePatterns || !persona.responsePatterns[patternKey]) {
        return null;
      }
  
      let response = persona.responsePatterns[patternKey];
      
      // Replace template variables
      Object.entries(variables).forEach(([key, value]) => {
        response = response.replace(`{${key}}`, value);
      });
  
      return response;
    }
  
    /**
     * Get all available personas
     * @returns {Array} List of personas with basic info
     */
    getAllPersonas() {
      return Object.values(this.personas).map(persona => ({
        id: persona.id,
        name: persona.name,
        role: persona.role,
        description: persona.description
      }));
    }
  }
  
  export default new PersonaService();