// server/models/Problem.js
const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  // Add type field
  type: {
    type: String,
    enum: ['interview', 'coaching', 'both'],
    default: 'both'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  estimatedTime: {
    type: Number,
    default: 60
  },
  requirements: {
    functional: [String],
    nonFunctional: [String]
  },
  constraints: {
    type: Map,
    of: String
  },
  promptSequence: [{
    id: String,
    name: String,
    question: String,
    prompt: String,
    expectedTopics: [String]
  }],
  referenceArchitecture: {
    components: [Object]
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

// Virtual for simplified view
problemSchema.virtual('preview').get(function() {
  return {
    id: this.id,
    title: this.title,
    difficulty: this.difficulty,
    description: this.description.substring(0, 100) + '...',
    estimatedTime: this.estimatedTime,
    type: this.type
  };
});

// Update timestamps on save
problemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;