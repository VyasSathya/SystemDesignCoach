// client/components/diagram/utils/nodePresets.js

/**
 * Node presets for system design components
 * These are used to create consistent node types for the diagram editor
 */
export const NODE_TYPES = {
    CLIENT: 'client',
    SERVICE: 'service',
    DATABASE: 'database',
    CACHE: 'cache',
    LOAD_BALANCER: 'loadBalancer',
    QUEUE: 'queue',
    CUSTOM: 'custom'
  };
  
  /**
   * Creates a new node with a unique ID based on the node type
   * @param {string} type - The type of node (from NODE_TYPES)
   * @param {object} position - The position {x, y} of the node
   * @param {string} label - The label text for the node
   * @param {string} notes - Optional notes for the node
   * @returns {object} - A React Flow node object
   */
  export const createNode = (type, position, label = '', notes = '') => {
    const nodeLabels = {
      [NODE_TYPES.CLIENT]: 'Client',
      [NODE_TYPES.SERVICE]: 'Service',
      [NODE_TYPES.DATABASE]: 'Database',
      [NODE_TYPES.CACHE]: 'Cache',
      [NODE_TYPES.LOAD_BALANCER]: 'Load Balancer',
      [NODE_TYPES.QUEUE]: 'Queue',
      [NODE_TYPES.CUSTOM]: 'Custom Component'
    };
    
    // Use provided label or default
    const nodeLabel = label || nodeLabels[type] || 'Node';
    
    return {
      id: `${type}_${Date.now()}`,
      type,
      position,
      data: {
        label: nodeLabel,
        notes
      }
    };
  };
  
  /**
   * Creates a connection between two nodes
   * @param {string} sourceId - The ID of the source node
   * @param {string} targetId - The ID of the target node
   * @param {string} label - Optional label for the connection
   * @returns {object} - A React Flow edge object
   */
  export const createEdge = (sourceId, targetId, label = '') => {
    return {
      id: `edge-${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      label,
      type: 'smoothstep',
      animated: false,
      style: { strokeWidth: 2 }
    };
  };
  
  /**
   * Returns a palette of node type options for the editor UI
   */
  export const getNodeTypePalette = () => [
    {
      type: NODE_TYPES.CLIENT,
      label: 'Client',
      description: 'User-facing components like web browsers or mobile apps',
      color: 'blue'
    },
    {
      type: NODE_TYPES.SERVICE,
      label: 'Service',
      description: 'Backend services that process business logic',
      color: 'green'
    },
    {
      type: NODE_TYPES.DATABASE,
      label: 'Database',
      description: 'Data storage systems (SQL, NoSQL, etc.)',
      color: 'purple'
    },
    {
      type: NODE_TYPES.CACHE,
      label: 'Cache',
      description: 'In-memory data stores for quick access (Redis, Memcached)',
      color: 'red'
    },
    {
      type: NODE_TYPES.LOAD_BALANCER,
      label: 'Load Balancer',
      description: 'Distributes network traffic across multiple servers',
      color: 'orange'
    },
    {
      type: NODE_TYPES.QUEUE,
      label: 'Queue',
      description: 'Message queues for asynchronous processing',
      color: 'indigo'
    },
    {
      type: NODE_TYPES.CUSTOM,
      label: 'Custom',
      description: 'Custom component with user-defined functionality',
      color: 'gray'
    }
  ];