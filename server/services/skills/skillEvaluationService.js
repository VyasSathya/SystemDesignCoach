const { skillsFramework, calculateSkillLevel, getSkillFeedback } = require('../../../data/enhanced_skills');
const AIFactory = require('../ai/aiFactory');
const aiConfig = require('../../config/aiConfig');

class SkillEvaluationService {
  constructor() {
    this.aiService = AIFactory.createService(aiConfig.defaultProvider, aiConfig[aiConfig.defaultProvider]);
  }

  async evaluateResponse(category, skillName, response, context) {
    const skill = skillsFramework[category][skillName];
    if (!skill) {
      throw new Error(`Invalid skill: ${category}.${skillName}`);
    }

    const prompt = this._buildEvaluationPrompt(skill, response, context);
    const evaluation = await this._getAIEvaluation(prompt);
    
    return {
      ...evaluation,
      feedback: getSkillFeedback({ category, name: skillName }, evaluation.metrics)
    };
  }

  async evaluateDesignSession(sessionData) {
    const evaluations = {};
    
    // Evaluate technical skills
    if (sessionData.diagrams) {
      evaluations.system_architecture = await this.evaluateResponse(
        'technical',
        'system_architecture',
        sessionData.diagrams.architecture,
        { type: 'diagram' }
      );
    }

    if (sessionData.apis) {
      evaluations.api_design = await this.evaluateResponse(
        'technical',
        'api_design',
        sessionData.apis,
        { type: 'api_specification' }
      );
    }

    // Evaluate communication skills from conversation
    if (sessionData.conversation) {
      evaluations.communication = await this.evaluateResponse(
        'soft',
        'communication',
        sessionData.conversation,
        { type: 'dialogue' }
      );
    }

    return {
      evaluations,
      summary: this._generateSessionSummary(evaluations)
    };
  }

  _buildEvaluationPrompt(skill, response, context) {
    return {
      role: 'system',
      content: `You are evaluating a candidate's ${skill.name} skills. 
                Consider the following evaluation points: ${JSON.stringify(skill.evaluation_points)}.
                Provide numerical scores (0-1) for each completion criteria: ${JSON.stringify(skill.completion_criteria)}.
                Context type: ${context.type}`,
    };
  }

  async _getAIEvaluation(prompt) {
    const response = await this.aiService.sendMessage([
      prompt,
      {
        role: 'user',
        content: 'Evaluate the response and provide metrics as JSON'
      }
    ]);

    try {
      // Extract metrics from AI response
      const metrics = JSON.parse(response.content);
      return {
        metrics,
        rawScore: Object.values(metrics).reduce((sum, val) => sum + val, 0) / Object.keys(metrics).length
      };
    } catch (error) {
      console.error('Failed to parse AI evaluation:', error);
      throw new Error('Failed to generate skill evaluation');
    }
  }

  _generateSessionSummary(evaluations) {
    const summary = {
      overallScore: 0,
      strengths: [],
      improvements: []
    };

    Object.entries(evaluations).forEach(([skill, evaluation]) => {
      summary.overallScore += evaluation.rawScore * skillsFramework[skill].weight;
      
      if (evaluation.feedback.strengths.length > 0) {
        summary.strengths.push({
          skill,
          points: evaluation.feedback.strengths
        });
      }

      if (evaluation.feedback.improvements.length > 0) {
        summary.improvements.push({
          skill,
          points: evaluation.feedback.improvements
        });
      }
    });

    return summary;
  }
}

module.exports = new SkillEvaluationService();