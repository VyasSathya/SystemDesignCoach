const logger = require('../../../utils/logger');
const PatternTemplates = require('./PatternTemplates');

const patterns = {
  loadBalancing: {
    id: 'loadBalancing',
    name: 'Load Balancing Pattern',
    category: 'scalability',
    description: 'Distributes incoming traffic across multiple service instances',
    detection: {
      required: {
        nodes: [
          { type: 'service', minCount: 2 },
          { type: 'loadBalancer', count: 1 }
        ],
        connections: ['loadBalancer-service']
      }
    },
    bestPractices: [
      'Health checks should be implemented',
      'Multiple service instances should be in different availability zones',
      'Consider session persistence requirements'
    ]
  },

  caching: {
    id: 'caching',
    name: 'Caching Pattern',
    category: 'performance',
    description: 'Improves response times and reduces database load',
    detection: {
      required: {
        nodes: [
          { type: 'cache', count: 1 },
          { type: 'service', minCount: 1 }
        ],
        connections: ['service-cache']
      }
    },
    bestPractices: [
      'Implement cache eviction policies',
      'Consider cache coherency',
      'Define appropriate TTL values'
    ]
  },

  apiGateway: {
    id: 'apiGateway',
    name: 'API Gateway Pattern',
    category: 'architecture',
    description: 'Provides a unified entry point for API consumers',
    detection: {
      required: {
        nodes: [
          { type: 'gateway', count: 1 },
          { type: 'service', minCount: 2 }
        ],
        connections: ['gateway-service']
      }
    },
    bestPractices: [
      'Implement authentication/authorization',
      'Include rate limiting',
      'Consider request/response transformation'
    ]
  },

  messageQueue: {
    id: 'messageQueue',
    name: 'Message Queue Pattern',
    category: 'communication',
    description: 'Enables asynchronous communication between services',
    detection: {
      required: {
        nodes: [
          { type: 'queue', count: 1 },
          { type: 'service', minCount: 2 }
        ],
        connections: ['service-queue']
      }
    },
    bestPractices: [
      'Implement dead letter queues',
      'Consider message persistence',
      'Handle retry logic appropriately'
    ]
  },

  circuitBreaker: {
    id: 'circuitBreaker',
    name: 'Circuit Breaker',
    category: 'reliability',
    description: 'Prevents cascading failures in distributed systems',
    detection: {
      required: {
        nodes: [
          { type: 'service', min: 2 }
        ],
        connections: [
          { from: 'service', to: 'service', metadata: { type: 'circuit-breaker' } }
        ]
      }
    },
    bestPractices: [
      'Configure proper timeout thresholds',
      'Implement fallback mechanisms',
      'Monitor circuit breaker status'
    ]
  }
};

class PatternRegistry {
  constructor() {
    this.patterns = {
      loadBalancing: {
        id: 'loadBalancing',
        name: 'Load Balancing',
        category: 'scalability',
        detection: {
          required: {
            nodes: [
              { type: 'loadbalancer', count: 1 },
              { type: 'service', minCount: 2 }
            ],
            connections: ['loadbalancer-service']
          },
          optimal: {
            nodes: [
              { type: 'loadbalancer', count: 2 }, // For high availability
              { type: 'service', minCount: 3 }
            ]
          }
        }
      },
      caching: {
        id: 'caching',
        name: 'Caching',
        category: 'performance',
        detection: {
          required: {
            nodes: [
              { type: 'cache', count: 1 },
              { type: 'service', minCount: 1 }
            ],
            connections: ['service-cache']
          },
          optimal: {
            nodes: [
              { type: 'cache', count: 1 },
              { type: 'service', minCount: 1 }
            ],
            connections: ['client-cache', 'service-cache']
          }
        }
      },
      apiGateway: {
        id: 'apiGateway',
        name: 'API Gateway',
        category: 'architecture',
        detection: {
          required: {
            nodes: [
              { type: 'gateway', count: 1 },
              { type: 'service', minCount: 2 }
            ],
            connections: ['gateway-service']
          },
          optimal: {
            nodes: [
              { type: 'gateway', count: 1 },
              { type: 'service', minCount: 2 },
              { type: 'loadbalancer', count: 1 }
            ],
            connections: ['client-gateway', 'gateway-service', 'gateway-loadbalancer']
          }
        }
      },
      messageQueue: {
        id: 'messageQueue',
        name: 'Message Queue',
        category: 'messaging',
        detection: {
          required: {
            nodes: [
              { type: 'queue', count: 1 },
              { type: 'service', minCount: 2 }
            ],
            connections: ['service-queue']
          },
          optimal: {
            nodes: [
              { type: 'queue', count: 1 },
              { type: 'service', minCount: 2 }
            ],
            metadata: {
              connections: {
                type: 'async'
              }
            }
          }
        }
      },
      microservices: {
        id: 'microservices',
        name: 'Microservices',
        category: 'architecture',
        detection: {
          required: {
            nodes: [
              { type: 'service', minCount: 3 },
              { type: 'database', minCount: 2 }
            ]
          },
          optimal: {
            nodes: [
              { type: 'service', minCount: 3 },
              { type: 'database', minCount: 2 },
              { type: 'gateway', count: 1 },
              { type: 'loadbalancer', minCount: 1 }
            ]
          }
        }
      }
    };
  }

  getPattern(patternId) {
    return this.patterns[patternId];
  }

  getAllPatterns() {
    return Object.values(this.patterns);
  }

  getPatternsByCategory(category) {
    return Object.values(this.patterns)
      .filter(pattern => pattern.category === category);
  }

  detectPatterns(diagram) {
    const detectedPatterns = [];
    
    for (const pattern of Object.values(this.patterns)) {
      const matches = this._findPatternMatches(diagram, pattern.detection);
      if (matches.length > 0) {
        detectedPatterns.push({
          ...pattern,
          matches,
          implementation: this._analyzeImplementationQuality(diagram, pattern, matches)
        });
      }
    }

    return detectedPatterns;
  }

  _matchesPattern(diagram, detection) {
    const { nodes, edges } = diagram;

    // Check required nodes
    if (detection.required.nodes) {
      for (const req of detection.required.nodes) {
        const count = nodes.filter(n => n.type === req.type).length;
        if (req.count && count !== req.count) return false;
        if (req.minCount && count < req.minCount) return false;
      }
    }

    // Check required connections
    if (detection.required.connections) {
      for (const conn of detection.required.connections) {
        const [fromType, toType] = conn.split('-');
        const hasConnection = edges.some(edge => {
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          return source?.type === fromType && target?.type === toType;
        });
        if (!hasConnection) return false;
      }
    }

    return true;
  }

  _findPatternMatches(diagram, detection) {
    const matches = [];
    const { nodes, edges } = diagram;

    // Find all possible combinations of nodes that match the pattern
    const nodeGroups = this._findMatchingNodeGroups(nodes, detection.required.nodes);

    for (const nodeGroup of nodeGroups) {
      // Check if the connections between these nodes match the pattern
      if (this._validateConnections(nodeGroup, edges, detection.required.connections)) {
        matches.push({
          nodes: nodeGroup,
          edges: this._getRelevantEdges(nodeGroup, edges)
        });
      }
    }

    return matches;
  }

  _findMatchingNodeGroups(nodes, requirements) {
    if (!requirements) return [nodes];

    const groups = [];
    const typeGroups = {};

    // Group nodes by type
    for (const node of nodes) {
      if (!typeGroups[node.type]) {
        typeGroups[node.type] = [];
      }
      typeGroups[node.type].push(node);
    }

    // Validate type requirements
    for (const req of requirements) {
      const typeNodes = typeGroups[req.type] || [];
      if (req.count && typeNodes.length !== req.count) return [];
      if (req.minCount && typeNodes.length < req.minCount) return [];
    }

    // For simple cases, return all matching nodes
    const matchingNodes = nodes.filter(node => 
      requirements.some(req => req.type === node.type)
    );

    return [matchingNodes];
  }

  _validateConnections(nodes, edges, requiredConnections) {
    if (!requiredConnections) return true;

    for (const conn of requiredConnections) {
      const [fromType, toType] = conn.split('-');
      const hasConnection = edges.some(edge => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        return source?.type === fromType && target?.type === toType;
      });
      if (!hasConnection) return false;
    }

    return true;
  }

  _getRelevantEdges(nodes, edges) {
    const nodeIds = new Set(nodes.map(n => n.id));
    return edges.filter(edge => 
      nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );
  }

  _analyzeImplementationQuality(diagram, pattern, matches) {
    const quality = {
      score: 0,
      optimal: false,
      missingOptimal: [],
      suggestions: []
    };

    if (!pattern.detection.optimal) {
      quality.score = 1;
      quality.optimal = true;
      return quality;
    }

    const { nodes, edges } = diagram;
    const optimal = pattern.detection.optimal;

    // Check optimal nodes
    if (optimal.nodes) {
      for (const req of optimal.nodes) {
        const count = nodes.filter(n => n.type === req.type).length;
        if (req.count && count !== req.count) {
          quality.missingOptimal.push(`Need ${req.count} ${req.type} nodes, found ${count}`);
        }
        if (req.minCount && count < req.minCount) {
          quality.missingOptimal.push(`Need at least ${req.minCount} ${req.type} nodes, found ${count}`);
        }
      }
    }

    // Check optimal connections
    if (optimal.connections) {
      for (const conn of optimal.connections) {
        const [fromType, toType] = conn.split('-');
        const hasConnection = edges.some(edge => {
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          return source?.type === fromType && target?.type === toType;
        });
        if (!hasConnection) {
          quality.missingOptimal.push(`Missing optimal connection from ${fromType} to ${toType}`);
        }
      }
    }

    // Check metadata requirements
    if (optimal.metadata) {
      this._matchesMetadata(edges, optimal.metadata);
    }

    // Calculate quality score
    quality.score = 1 - (quality.missingOptimal.length / (optimal.nodes?.length || 1));
    quality.optimal = quality.missingOptimal.length === 0;

    return quality;
  }

  _matchesMetadata(edges, requiredMetadata) {
    if (!requiredMetadata.connections) return true;

    return edges.every(edge => {
      for (const [key, value] of Object.entries(requiredMetadata.connections)) {
        if (edge.data?.[key] !== value) return false;
      }
      return true;
    });
  }
}

module.exports = PatternRegistry;