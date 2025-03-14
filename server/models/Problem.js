const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['interview', 'coaching', 'both'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  description: String,
  estimatedTime: Number,
  requirements: {
    functional: [String],
    nonFunctional: [String]
  }
}, {
  timestamps: true
});

ProblemSchema.index({ id: 1 }, { unique: true, name: 'problem_id_unique' });
ProblemSchema.index({ type: 1 }, { name: 'problem_type' });
ProblemSchema.index({ difficulty: 1 }, { name: 'problem_difficulty' });

const Problem = mongoose.model('Problem', ProblemSchema);
module.exports = Problem;