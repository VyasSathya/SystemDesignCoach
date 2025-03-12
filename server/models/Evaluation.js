// server/models/Evaluation.js
const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  score: Number,
  maxScore: Number
}, { _id: false });

const evaluationSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true
  },
  evaluationType: {
    type: String,
    enum: ['coaching', 'interview'],
    required: true
  },
  userLevel: {
    type: String,
    enum: ['junior', 'mid-level', 'senior', 'staff+'],
    default: 'mid-level'
  },
  problemId: {
    type: String
  },
  content: {
    type: String,
    required: true
  },
  scores: {
    overall: scoreSchema,
    'Requirements Analysis': scoreSchema,
    'System Interface Design': scoreSchema,
    'Capacity Estimation': scoreSchema,
    'Data Modeling': scoreSchema,
    'High-Level Architecture': scoreSchema,
    'Detailed Component Design': scoreSchema,
    'Scalability & Performance': scoreSchema,
    'Reliability & Fault Tolerance': scoreSchema
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isFinal: {
    type: Boolean,
    default: false
  }
});

// Add indexes for efficient queries
evaluationSchema.index({ sessionId: 1 });
evaluationSchema.index({ sessionId: 1, timestamp: -1 });

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

module.exports = Evaluation;