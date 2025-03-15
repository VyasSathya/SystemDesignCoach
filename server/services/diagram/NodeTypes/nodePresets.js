// Common node types and their default configurations
const nodePresets = {
  service: {
    type: 'service',
    category: 'compute',
    defaults: {
      scalable: true,
      stateless: true,
      hasHealthCheck: true
    },
    requirements: {
      connections: ['database', 'cache', 'queue'],
      security: ['authentication', 'authorization']
    }
  },
  
  loadBalancer: {
    type: 'loadBalancer',
    category: 'networking',
    defaults: {
      algorithm: 'round-robin',
      healthChecks: true
    },
    requirements: {
      connections: ['service'],
      minimum: {
        targets: 2
      }
    }
  },

  database: {
    type: 'database',
    category: 'storage',
    defaults: {
      persistent: true,
      backup: true
    },
    requirements: {
      connections: ['service'],
      security: ['encryption', 'access-control']
    }
  },

  cache: {
    type: 'cache',
    category: 'storage',
    defaults: {
      volatile: true,
      evictionPolicy: 'LRU'
    },
    requirements: {
      connections: ['service']
    }
  },

  queue: {
    type: 'queue',
    category: 'messaging',
    defaults: {
      persistent: true,
      ordered: true
    },
    requirements: {
      connections: ['service'],
      patterns: ['publisher-subscriber', 'point-to-point']
    }
  },

  gateway: {
    type: 'gateway',
    category: 'networking',
    defaults: {
      routing: true,
      authentication: true
    },
    requirements: {
      connections: ['service', 'loadBalancer'],
      security: ['rate-limiting', 'authentication']
    }
  }
};

// Helper functions for node type validation and properties
const nodeTypeHelpers = {
  isValidType: (type) => Object.keys(nodePresets).includes(type),
  
  getDefaultProperties: (type) => {
    if (!nodePresets[type]) return {};
    return { ...nodePresets[type].defaults };
  },
  
  getRequirements: (type) => {
    if (!nodePresets[type]) return {};
    return { ...nodePresets[type].requirements };
  },
  
  getCategory: (type) => {
    if (!nodePresets[type]) return 'unknown';
    return nodePresets[type].category;
  }
};

module.exports = {
  nodePresets,
  nodeTypeHelpers
};