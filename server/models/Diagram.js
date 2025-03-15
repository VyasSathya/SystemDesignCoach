const mongoose = require('mongoose');

const DiagramSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  diagramId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['system', 'sequence']
  },
  currentScore: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  snapshots: [{
    timestamp: Date,
    scores: {
      overall: Number,
      scalability: {
        value: Number,
        factors: [String]
      },
      reliability: {
        value: Number,
        factors: [String]
      },
      security: {
        value: Number,
        factors: [String]
      },
      maintainability: {
        value: Number,
        factors: [String]
      }
    },
    componentCounts: {
      type: Map,
      of: Number
    },
    complexity: {
      nodes: Number,
      edges: Number,
      density: Number,
      avgConnections: Number
    },
    patterns: {
      loadBalancing: Boolean,
      caching: Boolean,
      messageQueue: Boolean,
      apiGateway: Boolean,
      serviceDiscovery: Boolean,
      circuitBreaker: Boolean
    }
  }]
});

// Indexes for efficient querying
DiagramSchema.index({ sessionId: 1, diagramId: 1 }, { unique: true });
DiagramSchema.index({ lastUpdated: -1 });
DiagramSchema.index({ currentScore: -1 });

module.exports = mongoose.model('Diagram', DiagramSchema);
