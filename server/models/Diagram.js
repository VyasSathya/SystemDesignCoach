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
  // Store both ReactFlow and Mermaid representations
  reactFlow: {
    nodes: [{
      id: String,
      type: String,
      position: {
        x: Number,
        y: Number
      },
      data: mongoose.Schema.Types.Mixed,
      // Additional positioning metadata
      mermaidPosition: {
        order: Number,      // For sequence diagrams
        level: Number,      // For system diagrams, vertical level
        column: Number      // For system diagrams, horizontal position
      }
    }],
    edges: [{
      id: String,
      source: String,
      target: String,
      type: String,
      sourceHandle: String,
      targetHandle: String,
      data: mongoose.Schema.Types.Mixed,
      // Store exact positions for recreation
      sourcePosition: {
        x: Number,
        y: Number
      },
      targetPosition: {
        x: Number,
        y: Number
      }
    }]
  },
  mermaidCode: {
    type: String,
    required: true
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
