// server/models/Interview.js
const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: String,
    required: true
  },
  // Add type field to distinguish between interview and coaching sessions
  type: {
    type: String,
    enum: ['interview', 'coaching'],
    default: 'interview'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'in_progress'
  },
  conversation: [{
    role: {
      type: String,
      // Add coach and student roles
      enum: ['interviewer', 'candidate', 'coach', 'student', 'system'],
      required: true
    },
    
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  }],
    diagrams: [{
        type: {
        type: String,
        enum: ['architecture', 'sequence', 'systems', 'er', 'component'],
        default: 'architecture'
        },
        mermaidCode: {
        type: String,
        required: true
        },
        reactFlowData: {
        type: Object  // Store React Flow's JSON representation
        },
        name: {
        type: String,
        default: 'System Design'
        },
        createdAt: {
        type: Date,
        default: Date.now
        },
        updatedAt: {
        type: Date,
        default: Date.now
        },
        history: [{
        mermaidCode: String,
        reactFlowData: Object,
        timestamp: {
            type: Date,
            default: Date.now
        }
        }]
  }],
  currentStage: {
    type: String,
    // Don't use enum here to allow flexibility between interview and coaching stages
    default: 'intro'
  },
  currentQuestion: {
    type: Number,
    default: 0
  },
  evaluation: {
    score: Number,
    feedback: String,
    strengths: [String],
    weaknesses: [String],
    areas_to_improve: [String],
    criteriaScores: {
      type: Map,
      of: Number
    }
  },
  duration: {
    type: Number,  // Interview duration in seconds
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

// Add index for faster queries - include type for better filtering
interviewSchema.index({ userId: 1, status: 1, type: 1 });

module.exports = mongoose.model('Interview', interviewSchema);