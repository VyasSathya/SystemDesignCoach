const mongoose = require('mongoose');

const EvaluationSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: String,
    required: true
  },
  criteria: [{
    name: String,
    score: Number,
    feedback: String
  }],
  overallScore: {
    type: Number,
    required: true
  },
  feedback: {
    strengths: [String],
    improvements: [String],
    generalComments: String
  },
  evaluatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

EvaluationSchema.index({ sessionId: 1 }, { name: 'evaluation_session_id' });
EvaluationSchema.index({ userId: 1 }, { name: 'evaluation_user_id' });
EvaluationSchema.index({ problemId: 1 }, { name: 'evaluation_problem_id' });

const Evaluation = mongoose.model('Evaluation', EvaluationSchema);
module.exports = Evaluation;
