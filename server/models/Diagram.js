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
  metadata: {
    title: String,
    description: String,
    created: Date,
    updated: Date
  },
  // ReactFlow-specific data
  diagram: {
    nodes: [{
      id: String,
      type: {
        type: String,
        enum: [
          // System types
          'service', 'database', 'cache', 'loadbalancer', 
          'gateway', 'queue', 'client',
          // Sequence types
          'user', 'external', 'component'
        ]
      },
      label: String,
      position: {
        x: Number,
        y: Number
      },
      // Type-specific configuration
      config: {
        // For sequence diagrams
        order: Number,
        // For system diagrams
        scalability: String,
        reliability: String,
        // Common
        notes: String,
        customProperties: Map
      }
    }],
    edges: [{
      id: String,
      source: String,
      target: String,
      type: {
        type: String,
        enum: ['sync', 'async', 'depends', 'callback']
      },
      label: String,
      // Type-specific configuration
      config: {
        protocol: String,
        latency: String,
        reliability: String,
        notes: String
      }
    }]
  },
  // Optional alternative representations
  representations: {
    mermaid: String,
    plantuml: String,
    c4: String
  },
  currentScore: Number,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying
DiagramSchema.index({ sessionId: 1, diagramId: 1 }, { unique: true });
DiagramSchema.index({ lastUpdated: -1 });
DiagramSchema.index({ currentScore: -1 });

module.exports = mongoose.model('Diagram', DiagramSchema);
