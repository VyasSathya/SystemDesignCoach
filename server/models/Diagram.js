const mongoose = require('mongoose');

const DiagramSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['architecture', 'sequence', 'flowchart', 'er', 'component'],
    default: 'architecture'
  },
  mermaidCode: {
    type: String,
    required: true
  },
  reactFlowData: {
    type: mongoose.Schema.Types.Mixed
  },
  name: {
    type: String,
    default: 'System Design'
  },
  version: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
DiagramSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Diagram', DiagramSchema);