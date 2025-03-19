const diagramStructure = {
  system: {
    allowedNodes: ['service', 'database', 'queue', 'cache', 'gateway', 'loadBalancer'],
    allowedEdges: ['request', 'response', 'publish', 'subscribe', 'sync', 'async'],
    validation: {
      minNodes: 2,
      maxNodes: 20,
      requiresGateway: false
    }
  },
  sequence: {
    allowedNodes: ['actor', 'service', 'database', 'external'],
    allowedEdges: ['sync', 'async', 'return'],
    validation: {
      minNodes: 2,
      maxNodes: 10,
      requiresActor: true
    }
  }
};

module.exports = {
  diagramStructure
};