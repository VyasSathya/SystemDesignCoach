import { STYLE_CONSTANTS } from '../SequenceDiagramPlan';

/**
 * Creates a new participant node
 * @param {string} type - Type of participant ('actor', 'system', 'database')
 * @param {object} position - The position {x, y} of the node
 * @returns {object} Node object
 */
export const createParticipantNode = (type, position) => {
  const nodeId = `${type}_${Date.now()}`;
  
  return {
    id: nodeId,
    type,
    position,
    data: {
      label: '', // Empty label initially - will be set by handleSaveNodeName
      type,
      lifelineHeight: STYLE_CONSTANTS.spacing.lifelineExtension,
      isConnectable: true
    },
    draggable: true,
    connectable: true
  };
};

/**
 * Calculate the next available x position for a new participant
 * @param {Object[]} existingNodes - Current nodes in the diagram
 * @returns {object} Position coordinates
 */
export const calculateNextPosition = (existingNodes) => {
  const participantNodes = existingNodes.filter(
    node => ['actor', 'system', 'database'].includes(node.type)
  );
  
  const x = participantNodes.length === 0 
    ? STYLE_CONSTANTS.spacing.horizontalGap 
    : participantNodes[participantNodes.length - 1].position.x + STYLE_CONSTANTS.spacing.horizontalGap;

  return {
    x,
    y: STYLE_CONSTANTS.spacing.topMargin
  };
};

/**
 * Creates a connection between two nodes
 * @param {string} sourceId - Source node ID
 * @param {string} targetId - Target node ID
 * @param {string} label - Optional label for the connection
 * @returns {object} Edge object
 */
export const createEdge = (sourceId, targetId, label = '') => {
  return {
    id: `edge-${sourceId}-${targetId}-${Date.now()}`,
    source: sourceId,
    target: targetId,
    label,
    type: 'smoothstep',
    animated: false,
    style: { strokeWidth: 2 }
  };
};
