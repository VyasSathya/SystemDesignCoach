const { nodePresets } = require('../NodeTypes/nodePresets');

const patternTemplates = {
  loadBalancing: {
    name: 'Load Balancing Pattern',
    required: {
      nodes: ['loadBalancer', 'service'],
      minServices: 2
    },
    optimal: {
      redundancy: true,
      healthChecks: true
    }
  },

  caching: {
    name: 'Caching Pattern',
    required: {
      nodes: ['cache', 'service']
    },
    optimal: {
      evictionPolicy: true,
      monitoring: true
    }
  },

  messageQueue: {
    name: 'Message Queue Pattern',
    required: {
      nodes: ['queue', 'service']
    },
    optimal: {
      deadLetterQueue: true,
      errorHandling: true
    }
  },

  apiGateway: {
    name: 'API Gateway Pattern',
    required: {
      nodes: ['gateway', 'service']
    },
    optimal: {
      authentication: true,
      rateLimiting: true,
      routing: true
    }
  }
};

module.exports = {
  patternTemplates
};
