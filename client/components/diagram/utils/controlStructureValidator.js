export class ControlStructureValidator {
  static validateStructure(structure, existingStructures) {
    // Check for required fields
    if (!this.hasRequiredFields(structure)) {
      return { valid: false, error: 'Missing required fields' };
    }

    // Validate based on type
    if (structure.type === 'LOOP') {
      return this.validateLoop(structure);
    } else if (structure.type === 'ALTERNATIVE') {
      return this.validateAlternative(structure);
    }

    return { valid: false, error: 'Invalid control structure type' };
  }

  static hasRequiredFields(structure) {
    const baseFields = ['type', 'condition'];
    if (!baseFields.every(field => structure.hasOwnProperty(field))) {
      return false;
    }

    if (structure.type === 'ALTERNATIVE') {
      return structure.hasOwnProperty('sections') && 
             Array.isArray(structure.sections) &&
             structure.sections.length > 0;
    }

    return true;
  }

  static validateLoop(loop) {
    if (!loop.messages || !Array.isArray(loop.messages) || loop.messages.length === 0) {
      return { valid: false, error: 'Loop must contain at least one message' };
    }

    return { valid: true };
  }

  static validateAlternative(alt) {
    // Check if each section has a condition
    const hasValidSections = alt.sections.every(section => 
      section.hasOwnProperty('condition') && 
      section.hasOwnProperty('messages') &&
      Array.isArray(section.messages)
    );

    if (!hasValidSections) {
      return { valid: false, error: 'All alternative sections must have conditions and messages' };
    }

    return { valid: true };
  }

  static checkOverlap(newStructure, existingStructures) {
    const newBounds = this.getStructureBounds(newStructure);
    
    return existingStructures.some(existing => {
      const existingBounds = this.getStructureBounds(existing);
      return this.boundsOverlap(newBounds, existingBounds);
    });
  }

  static getStructureBounds(structure) {
    return {
      x1: structure.position.x,
      y1: structure.position.y,
      x2: structure.position.x + structure.width,
      y2: structure.position.y + structure.height
    };
  }

  static boundsOverlap(bounds1, bounds2) {
    return !(
      bounds1.x2 < bounds2.x1 ||
      bounds1.x1 > bounds2.x2 ||
      bounds1.y2 < bounds2.y1 ||
      bounds1.y1 > bounds2.y2
    );
  }
}