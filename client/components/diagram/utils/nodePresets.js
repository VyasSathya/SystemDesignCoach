import { Database, Server, Globe, Archive, Grid, Share2, Gateway } from 'lucide-react';
import React from 'react';

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
  GATEWAY: 'gateway'
};

export const getNodeConfig = (type) => {
  const configs = {
    [NODE_TYPES.CLIENT]: {
      icon: <Globe className="w-6 h-6" />,
      color: '#3B82F6', // blue-500
      bgColor: '#EFF6FF', // blue-50
      label: 'Client'
    },
    [NODE_TYPES.SERVICE]: {
      icon: <Server className="w-6 h-6" />,
      color: '#10B981', // green-500
      bgColor: '#ECFDF5', // green-50
      label: 'Service'
    },
    [NODE_TYPES.DATABASE]: {
      icon: <Database className="w-6 h-6" />,
      color: '#8B5CF6', // purple-500
      bgColor: '#F5F3FF', // purple-50
      label: 'Database'
    },
    [NODE_TYPES.CACHE]: {
      icon: <Archive className="w-6 h-6" />,
      color: '#EF4444', // red-500
      bgColor: '#FEF2F2', // red-50
      label: 'Cache'
    },
    [NODE_TYPES.LOAD_BALANCER]: {
      icon: <Grid className="w-6 h-6" />,
      color: '#F97316', // orange-500
      bgColor: '#FFF7ED', // orange-50
      label: 'Load Balancer'
    },
    [NODE_TYPES.QUEUE]: {
      icon: <Share2 className="w-6 h-6" />,
      color: '#6366F1', // indigo-500
      bgColor: '#EEF2FF', // indigo-50
      label: 'Queue'
    },
    [NODE_TYPES.GATEWAY]: {
      icon: <Gateway className="w-6 h-6" />,
      color: '#14B8A6', // teal-500
      bgColor: '#F0FDFA', // teal-50
      label: 'API Gateway'
    }
  };

  return configs[type] || configs[NODE_TYPES.SERVICE];
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
  const nodeConfig = getNodeConfig(type);
  
  // Use provided label or default
  const nodeLabel = label || nodeConfig.label || 'Node';
  
  return {
    id: `${type}_${Date.now()}`,
    type,
    position,
    data: {
      label: nodeLabel,
      notes,
      ...nodeConfig
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
    type: NODE_TYPES.GATEWAY,
    label: 'API Gateway',
    description: 'API Gateway for managing API requests',
    color: 'teal'
  }
  ];