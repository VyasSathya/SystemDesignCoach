const mongoose = require('mongoose');

const DiagramSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['sequence', 'component', 'deployment'],
    required: true
  },
  content: String,
  metadata: {
    version: String,
    lastUpdated: Date
  }
});

const SectionSchema = new mongoose.Schema({
  content: String,
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'reviewed'],
    default: 'not_started'
  },
  feedback: [{
    type: {
      type: String,
      enum: ['coach', 'system', 'manual'],
      required: true
    },
    content: String,
    timestamp: Date
  }],
  evaluation: {
    score: Number,
    strengths: [String],
    improvements: [String],
    timestamp: Date
  }
});

const WorkbookSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  problemId: {
    type: String,
    required: true,
    index: true
  },
  sections: {
    requirements: {
      functional: SectionSchema,
      nonFunctional: SectionSchema
    },
    api: {
      endpoints: SectionSchema,
      documentation: SectionSchema
    },
    database: {
      schema: SectionSchema,
      queries: SectionSchema
    },
    architecture: {
      highLevel: SectionSchema,
      detailed: SectionSchema
    }
  },
  diagrams: [DiagramSchema],
  progress: {
    overall: {
      type: Number,
      default: 0
    },
    sections: Map,
    lastUpdated: Date
  },
  metadata: {
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }
});

WorkbookSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Workbook', WorkbookSchema);
