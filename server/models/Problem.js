const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
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
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the model
const Problem = mongoose.model('Problem', ProblemSchema);
module.exports = Problem;