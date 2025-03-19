const mongoose = require('mongoose');

const workbookDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: String,
    required: true
  },
  diagrams: {
    system: {
      nodes: [],
      edges: [],
      mermaidCode: String,
      lastUpdated: Date
    },
    sequence: {
      nodes: [],
      edges: [],
      mermaidCode: String,
      lastUpdated: Date
    }
  },
  chat: [{
    role: String,
    content: String,
    timestamp: Date
  }],
  sections: {
    requirements: mongoose.Schema.Types.Mixed,
    api: mongoose.Schema.Types.Mixed,
    data: mongoose.Schema.Types.Mixed,
    architecture: mongoose.Schema.Types.Mixed,
    scaling: mongoose.Schema.Types.Mixed,
    reliability: mongoose.Schema.Types.Mixed
  },
  lastSynced: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for faster queries
workbookDataSchema.index({ userId: 1, problemId: 1 }, { unique: true });

const WorkbookData = mongoose.model('WorkbookData', workbookDataSchema);
module.exports = WorkbookData;