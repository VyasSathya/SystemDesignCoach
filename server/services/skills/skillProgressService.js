const mongoose = require('mongoose');
const { evaluateSkillProgress, getSkillRequirements } = require('../../../data/enhanced_skills');

class SkillProgressService {
  constructor() {
    this.SkillProgress = mongoose.model('SkillProgress', new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      skills: {
        type: Map,
        of: {
          level: Number,
          history: [{
            timestamp: Date,
            metrics: Object,
            sessionId: String
          }],
          recentEvaluations: [{
            sessionId: String,
            score: Number,
            feedback: Object,
            timestamp: Date
          }]
        }
      }
    }));
  }

  async updateProgress(userId, sessionId, evaluations) {
    let progress = await this.SkillProgress.findOne({ userId });
    
    if (!progress) {
      progress = new this.SkillProgress({
        userId,
        skills: new Map()
      });
    }

    for (const [skillName, evaluation] of Object.entries(evaluations)) {
      const skillData = progress.skills.get(skillName) || {
        level: 1,
        history: [],
        recentEvaluations: []
      };

      // Add new evaluation
      skillData.recentEvaluations.unshift({
        sessionId,
        score: evaluation.rawScore,
        feedback: evaluation.feedback,
        timestamp: new Date()
      });

      // Keep only last 5 evaluations
      skillData.recentEvaluations = skillData.recentEvaluations.slice(0, 5);

      // Update history
      skillData.history.push({
        timestamp: new Date(),
        metrics: evaluation.metrics,
        sessionId
      });

      // Calculate new level
      const progressEvaluation = evaluateSkillProgress(
        { name: skillName },
        skillData.history[skillData.history.length - 2]?.metrics || {},
        evaluation.metrics
      );

      if (progressEvaluation.levelChange > 0) {
        skillData.level += progressEvaluation.levelChange;
      }

      progress.skills.set(skillName, skillData);
    }

    await progress.save();
    return progress;
  }

  async getSkillRoadmap(userId) {
    const progress = await this.SkillProgress.findOne({ userId });
    if (!progress) {
      return null;
    }

    const roadmap = {};
    for (const [skillName, skillData] of progress.skills) {
      const currentLevel = skillData.level;
      const nextLevel = currentLevel + 1;

      roadmap[skillName] = {
        currentLevel,
        requirements: getSkillRequirements({ name: skillName }, nextLevel),
        recentProgress: skillData.recentEvaluations.map(eval => ({
          score: eval.score,
          timestamp: eval.timestamp,
          key_feedback: eval.feedback.improvements.slice(0, 3)
        }))
      };
    }

    return roadmap;
  }
}

module.exports = new SkillProgressService();