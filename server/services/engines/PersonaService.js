const PersonaManager = require('../persona/PersonaManager');

class PersonaService {
  constructor() {
    this.personaManager = PersonaManager;
    this.activePersonaId = 'coach';
    this.conciseMode = true;
  }
  
  async initialize(config) {
    await this.personaManager.initialize();
    return this;
  }
  
  setActivePersona(personaId) {
    return this.personaManager.setActivePersona(personaId);
  }
  
  getActivePersona() {
    return this.personaManager.getPersonaContext(this.activePersonaId);
  }
  
  getSystemPrompt(context = {}) {
    const persona = this.getActivePersona();
    return persona.systemPrompt;
  }
}

module.exports = new PersonaService();
