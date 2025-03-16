const systemDiagramRules = {
  validateNodes: (nodes) => {
    // System-specific validation rules
    const requiredTypes = ['service', 'database'];
    const hasRequired = requiredTypes.every(type => 
      nodes.some(node => node.type === type)
    );
    if (!hasRequired) {
      throw new Error('System diagram must have at least one service and database');
    }
  },
  validateEdges: (edges, nodes) => {
    // Validate edge connections make sense
    // e.g., client can't connect directly to database
  }
};

const sequenceDiagramRules = {
  validateNodes: (nodes) => {
    // Sequence-specific validation
    if (!nodes.some(n => n.type === 'user')) {
      throw new Error('Sequence diagram must have at least one user actor');
    }
    // Validate node ordering
    const orders = nodes.map(n => n.config.order);
    if (new Set(orders).size !== orders.length) {
      throw new Error('Node orders must be unique');
    }
  },
  validateEdges: (edges, nodes) => {
    // Validate message flow makes sense
    // e.g., messages must flow in order
  }
};