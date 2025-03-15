const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  requirements: {
    functional: [String],
    nonFunctional: [String]
  },
  constraints: {
    scale: String,
    storage: String,
    bandwidth: String
  },
  expectedComponents: [String],
  evaluation: {
    criteria: [{
      name: String,
      weight: Number,
      description: String
    }],
    rubric: {
      excellent: String,
      good: String,
      fair: String,
      poor: String
    }
  },
  metadata: {
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

ProblemSchema.index({ difficulty: 1, category: 1 });

const Problem = mongoose.model('Problem', ProblemSchema);
module.exports = Problem;