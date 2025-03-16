export class ParticipantValidator {
  static validateParticipant(participant, existingParticipants) {
    // Check required fields
    if (!this.hasRequiredFields(participant)) {
      return { valid: false, error: 'Missing required fields' };
    }

    // Validate name uniqueness
    if (this.isDuplicateName(participant.name, existingParticipants)) {
      return { valid: false, error: 'Participant name must be unique' };
    }

    // Validate participant type
    if (!this.isValidType(participant.type)) {
      return { valid: false, error: 'Invalid participant type' };
    }

    // Validate horizontal position
    if (!this.isValidPosition(participant, existingParticipants)) {
      return { valid: false, error: 'Invalid participant position' };
    }

    return { valid: true };
  }

  static hasRequiredFields(participant) {
    return participant.name && 
           participant.type && 
           participant.position !== undefined;
  }

  static isDuplicateName(name, existingParticipants) {
    return existingParticipants.some(p => 
      p.name.toLowerCase() === name.toLowerCase()
    );
  }

  static isValidType(type) {
    return Object.values(CONSTANTS.PARTICIPANT_TYPES).includes(type);
  }

  static isValidPosition(participant, existingParticipants) {
    // Ensure participants maintain horizontal spacing
    const minSpacing = 150; // Minimum pixels between participants
    
    return !existingParticipants.some(p => 
      Math.abs(p.position.x - participant.position.x) < minSpacing
    );
  }
}