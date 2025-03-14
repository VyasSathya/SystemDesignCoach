const Interview = require('../../models/Interview');
const Problem = require('../../models/Problem');
const AIFactory = require('../ai/aiFactory');
const aiConfig = require('../../config/aiConfig');
const diagramEvaluationService = require('./diagramEvaluationService');

class DiagramService {
  constructor() {
    this.aiService = AIFactory.createService(
      aiConfig.defaultProvider, 
      aiConfig[aiConfig.defaultProvider]
    );
  }

  async generateDiagram(sessionId, type, context = {}) {
    const interview = await Interview.findById(sessionId);
    if (!interview) {
      throw new Error('Interview session not found');
    }

    const problem = await Problem.findOne({ id: interview.problemId });
    const prompt = this._buildGenerationPrompt(type, problem, context);
    
    const response = await this.aiService.sendMessage([
      { role: 'system', content: prompt.system },
      { role: 'user', content: prompt.user }
    ]);

    const mermaidCode = this.extractMermaidCode(response.content);
    return {
      type: 'mermaid',
      code: mermaidCode
    };
  }

  async evaluateDiagram(diagram, sessionId, type) {
    const interview = await Interview.findById(sessionId);
    const problem = await Problem.findOne({ id: interview.problemId });
    
    const evaluation = await diagramEvaluationService.evaluateDiagram(diagram, type, {
      problem: problem.title,
      requirements: problem.requirements,
      userLevel: interview.userLevel
    });

    // Store evaluation in interview session
    interview.diagrams = interview.diagrams || {};
    interview.diagrams[type] = {
      ...interview.diagrams[type],
      evaluation
    };
    await interview.save();

    return evaluation;
  }

  extractMermaidCode(text) {
    const mermaidRegex = /```mermaid\s*([\s\S]*?)\s*```/;
    const match = text.match(mermaidRegex);
    return match ? match[1].trim() : null;
  }

  _buildGenerationPrompt(type, problem, context) {
    return {
      system: `You are a software architect creating a ${type} diagram.
               Follow these guidelines:
               - Use clear and consistent naming
               - Focus on essential components
               - Show key relationships
               - Include necessary annotations`,
      user: `Create a ${type} diagram for: ${problem.title}
             Requirements: ${problem.requirements}
             Context: ${JSON.stringify(context)}
             Return the diagram in Mermaid syntax.`
    };
  }
}

module.exports = diagramService;