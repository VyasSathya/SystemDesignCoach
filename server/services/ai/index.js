// server/services/ai/index.js
const CoachEngine = require('../engines/coachEngine');
const InterviewEngine = require('../engines/interviewEngine');
const aiConfig = require('../../config/aiConfig');

console.log('🔵 Creating AI engines with config:', aiConfig[aiConfig.defaultProvider]);

const coachEngine = new CoachEngine({
  provider: aiConfig.defaultProvider,
  stages: [
    'introduction',
    'requirements',
    'architecture',
    'data-modeling',
    'scaling',
    'evaluation'
  ]
});

const interviewEngine = new InterviewEngine({
  provider: aiConfig.defaultProvider,
  evaluationThreshold: 0.8,
  diagramStageThreshold: 2
});

module.exports = {
  coachEngine,
  interviewEngine
};
