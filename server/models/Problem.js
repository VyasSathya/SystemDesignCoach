const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['coaching', 'interview', 'both'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  estimatedTime: {
    type: Number
  },
  requirements: {
    functional: [String],
    nonFunctional: [String]
  }
}, {
  timestamps: true
});

// Create the model from the schema
const Problem = mongoose.model('Problem', ProblemSchema);

// Export the model
module.exports = Problem;