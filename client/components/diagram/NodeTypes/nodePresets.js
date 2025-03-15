// Generate unique IDs for nodes
const generateId = (type) => `${type}-${Math.random().toString(36).substr(2, 9)}`;

// Create a new node with the given parameters
export const createNode = (type, position, label = '', notes = '') => {
  return {
    id: generateId(type),
    type,
    position,
    data: {
      label,
      notes
    }
  };
};

// Create a new edge between nodes
export const createEdge = (sourceId, targetId, label = '') => {
  return {
    id: `edge-${sourceId}-${targetId}`,
    source: sourceId,
    target: targetId,
    label,
    type: 'default'
  };
};

// Node type definitions with their properties
export const NODE_TYPES = {
  client: {
    label: 'Client',
    color: 'purple'
  },
  service: {
    label: 'Service',
    color: 'green'
  },
  database: {
    label: 'Database',
    color: 'blue'
  },
  loadBalancer: {
    label: 'Load Balancer',
    color: 'orange'
  },
  cache: {
    label: 'Cache',
    color: 'red'
  },
  queue: {
    label: 'Queue',
    color: 'yellow'
  },
  gateway: {
    label: 'Gateway',
    color: 'indigo'
  }
};

// Get palette configuration for node types
export const getNodeTypePalette = () => {
  return Object.entries(NODE_TYPES).map(([type, config]) => ({
    type,
    label: config.label,
    color: config.color
  }));
};