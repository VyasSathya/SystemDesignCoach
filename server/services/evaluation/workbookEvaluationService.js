const { skillsFramework } = require('../../../data/enhanced_skills');
const DiagramEvaluationService = require('../diagram/diagramEvaluationService');
const EvaluationService = require('./evaluationService');

class WorkbookEvaluationService {
  constructor() {
    this.evaluationService = new EvaluationService();
  }

  async evaluateSection(sessionId, section, content) {
    switch(section) {
      case 'diagram':
        return await DiagramEvaluationService.evaluateDiagram(content, 'system', { sessionId });
      
      case 'api_design':
        return await this.evaluationService.evaluateSection(sessionId, 'api_design', content);
      
      case 'requirements':
        return await this.evaluationService.evaluateSection(sessionId, 'requirements', content);
      
      case 'architecture':
        return await this.evaluationService.evaluateSection(sessionId, 'system_architecture', content);
      
      default:
        throw new Error(`Unknown section: ${section}`);
    }
  }

  async evaluateProgress(sessionId) {
    const workbook = await Workbook.findOne({ sessionId });
    if (!workbook) throw new Error('Workbook not found');

    const evaluations = {};
    const sections = ['requirements', 'api_design', 'architecture', 'diagram'];

    for (const section of sections) {
      if (workbook[section]) {
        evaluations[section] = await this.evaluateSection(sessionId, section, workbook[section]);
      }
    }

    return {
      evaluations,
      overallProgress: this._calculateOverallProgress(evaluations),
      recommendations: this._generateRecommendations(evaluations)
    };
  }

  _calculateOverallProgress(evaluations) {
    const weights = {
      requirements: 0.2,
      api_design: 0.25,
      architecture: 0.3,
      diagram: 0.25
    };

    return Object.entries(evaluations).reduce((total, [section, eval]) => {
      return total + (eval.completion || 0) * weights[section];
    }, 0);
  }

  _generateRecommendations(evaluations) {
    const recommendations = [];
    Object.entries(evaluations).forEach(([section, eval]) => {
      if (eval.completion < 0.7) {
        recommendations.push({
          section,
          priority: 'high',
          suggestions: eval.improvements || []
        });
      }
    });
    return recommendations;
  }
}

module.exports = new WorkbookEvaluationService();