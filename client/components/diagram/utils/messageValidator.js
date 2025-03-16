import { CONSTANTS } from './sequenceDiagramConstants';

export class MessageValidator {
  static validateMessage(message, participants, existingMessages) {
    // Check basic requirements
    if (!this.hasRequiredFields(message)) {
      return { valid: false, error: 'Missing required message fields' };
    }

    // Validate connection points
    const connectionValid = this.validateConnections(message, participants);
    if (!connectionValid.valid) {
      return connectionValid;
    }

    // Check for crossing messages
    if (this.hasCrossingMessages(message, existingMessages)) {
      return { valid: false, error: 'Messages cannot cross each other' };
    }

    // Validate temporal order
    if (!this.hasValidTemporalOrder(message, existingMessages)) {
      return { valid: false, error: 'Messages must maintain temporal order' };
    }

    // Check for self-messages
    if (this.isSelfMessage(message)) {
      return { valid: false, error: 'Self-messages are not allowed' };
    }

    // Validate synchronous message requirements
    if (message.type === 'SYNC' && !this.hasValidResponse(message, existingMessages)) {
      return { valid: false, error: 'Synchronous messages require a response' };
    }

    return { valid: true };
  }

  static hasRequiredFields(message) {
    return message.source && 
           message.target && 
           message.type && 
           message.position;
  }

  static validateConnections(message, participants) {
    // Check if source and target are valid lifelines
    const sourceParticipant = participants.find(p => p.id === message.source);
    const targetParticipant = participants.find(p => p.id === message.target);

    if (!sourceParticipant || !targetParticipant) {
      return { valid: false, error: 'Message must connect to valid lifelines' };
    }

    // Ensure horizontal travel only
    if (message.position.y !== message.targetPosition.y) {
      return { valid: false, error: 'Messages must travel horizontally' };
    }

    return { valid: true };
  }

  static hasCrossingMessages(newMessage, existingMessages) {
    return existingMessages.some(existing => {
      // Check if messages cross in both X and Y coordinates
      const crossesX = (
        Math.min(existing.source.x, existing.target.x) < Math.max(newMessage.source.x, newMessage.target.x) &&
        Math.max(existing.source.x, existing.target.x) > Math.min(newMessage.source.x, newMessage.target.x)
      );

      const crossesY = (
        Math.min(existing.position.y, existing.position.y) < newMessage.position.y &&
        Math.max(existing.position.y, existing.position.y) > newMessage.position.y
      );

      return crossesX && crossesY;
    });
  }

  static hasValidTemporalOrder(newMessage, existingMessages) {
    // Messages must maintain temporal order (higher Y value = later in time)
    return !existingMessages.some(existing => 
      existing.source === newMessage.source && 
      existing.position.y > newMessage.position.y
    );
  }

  static isSelfMessage(message) {
    return message.source === message.target;
  }

  static hasValidResponse(syncMessage, existingMessages) {
    // Check for a corresponding response message
    return existingMessages.some(msg => 
      msg.source === syncMessage.target &&
      msg.target === syncMessage.source &&
      msg.position.y > syncMessage.position.y
    );
  }
}