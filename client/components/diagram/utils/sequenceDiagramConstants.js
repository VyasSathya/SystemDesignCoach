export const CONSTANTS = {
  PARTICIPANT_TYPES: {
    USER: 'USER',
    SYSTEM: 'SYSTEM',
    DATABASE: 'DATABASE'
  },

  PARTICIPANT_COLORS: {
    USER: '#1976d2',    // Blue
    SYSTEM: '#2e7d32',  // Green
    DATABASE: '#7b1fa2' // Purple
  },

  MESSAGE_TYPES: {
    SYNC: 'SYNC',
    ASYNC: 'ASYNC'
  },

  LAYOUT: {
    PARTICIPANT_WIDTH: 120,
    PARTICIPANT_HEIGHT: 60,
    PARTICIPANT_SPACING: 150,
    LIFELINE_WIDTH: 2,
    MESSAGE_SPACING: 50,
    VERTICAL_SPACING: 20
  },

  VALIDATION: {
    MIN_MESSAGE_SPACING: 30,
    MIN_PARTICIPANT_SPACING: 150,
    ALIGNMENT_TOLERANCE: 2
  }
};

export const validateParticipant = (participant, existingParticipants) => {
  // Check unique name
  if (existingParticipants.some(p => p.data.label === participant.data.label)) {
    return { valid: false, error: 'Participant name must be unique' };
  }

  // Check valid type
  if (!Object.values(CONSTANTS.PARTICIPANT_TYPES).includes(participant.data.type)) {
    return { valid: false, error: 'Invalid participant type' };
  }

  return { valid: true };
};

export const validateConnection = (connection) => {
  const { source, target, sourceHandle, targetHandle } = connection;
  
  // Must connect from right to left handles only
  if (sourceHandle !== 'right' || targetHandle !== 'left') {
    return false;
  }
  
  // No self connections
  if (source === target) {
    return false;
  }
  
  return true;
};

export const validateNodeMovement = (node, newPosition) => {
  return {
    x: newPosition.x,
    y: CONSTANTS.PARTICIPANT_Y_POSITION // Force Y position
  };
};