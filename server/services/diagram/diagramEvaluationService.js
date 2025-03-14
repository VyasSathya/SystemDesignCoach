const mongoose = require('mongoose');
const { Evaluation } = require('../../models/Evaluation');
const { Session } = require('../../models/Session');
const { mermaidToReactFlow } = require('../../../client/components/diagram/utils/conversion');

class DiagramEvaluationService {
  static evaluationCriteria = {
    componentStructure: {
      weight: 0.25,
      rules: [
        'appropriate_component_types',
        'logical_connections',
        'component_granularity'
      ]
    },
    scalability: {
      weight: 0.2,
      rules: [
        'load_balancing',
        'caching_strategy',
        'database_partitioning'
      ]
    },
    reliability: {
      weight: 0.2,
      rules: [
        'fault_tolerance',
        'redundancy',
        'backup_systems'
      ]
    },
    security: {
      weight: 0.15,
      rules: [
        'authentication',
        'authorization',
        'data_encryption'
      ]
    },
    clarity: {
      weight: 0.2,
      rules: [
        'naming_conventions',
        'diagram_organization',
        'documentation'
      ]
    }
  };

  static async evaluateDiagram(diagram, type, context) {
    const normalizedDiagram = await this._normalizeDiagram(diagram, type);
    const session = await Session.findById(context.sessionId);
    
    const evaluation = {
      timestamp: new Date(),
      scores: {},
      feedback: {},
      suggestions: [],
      criteria: this.evaluationCriteria
    };

    // Evaluate each criterion
    for (const [criterion, config] of Object.entries(this.evaluationCriteria)) {
      const result = await this._evaluateCriterion(
        normalizedDiagram,
        criterion,
        config,
        context
      );
      
      evaluation.scores[criterion] = result.score;
      evaluation.feedback[criterion] = result.feedback;
      evaluation.suggestions.push(...result.suggestions);
    }

    // Calculate overall score
    evaluation.overallScore = this._calculateOverallScore(evaluation.scores);

    // Store evaluation
    await this._storeEvaluation(evaluation, context);

    return evaluation;
  }

  static async _evaluateCriterion(diagram, criterion, config, context) {
    const componentAnalysis = this._analyzeComponents(diagram);
    const result = { score: 0, feedback: '', suggestions: [] };

    switch (criterion) {
      case 'componentStructure':
        result.score = this._evaluateComponentStructure(componentAnalysis);
        result.feedback = this._generateStructureFeedback(componentAnalysis);
        break;
      case 'scalability':
        result.score = this._evaluateScalability(componentAnalysis);
        result.feedback = this._generateScalabilityFeedback(componentAnalysis);
        break;
      // Add other criteria evaluations...
    }

    return result;
  }

  static _analyzeComponents(diagram) {
    const analysis = {
      components: {
        databases: diagram.nodes.filter(n => n.type === 'database'),
        services: diagram.nodes.filter(n => n.type === 'service'),
        loadBalancers: diagram.nodes.filter(n => n.type === 'loadBalancer'),
        caches: diagram.nodes.filter(n => n.type === 'cache'),
        clients: diagram.nodes.filter(n => n.type === 'client')
      },
      connections: diagram.edges,
      patterns: this._identifyPatterns(diagram)
    };

    return analysis;
  }

  static _identifyPatterns(diagram) {
    return {
      hasLoadBalancing: diagram.nodes.some(n => n.type === 'loadBalancer'),
      hasCaching: diagram.nodes.some(n => n.type === 'cache'),
      hasRedundancy: this._checkRedundancy(diagram),
      hasAuthentication: this._checkAuthenticationLayer(diagram)
    };
  }

  static async _storeEvaluation(evaluation, context) {
    const newEvaluation = new Evaluation({
      sessionId: context.sessionId,
      userId: context.userId,
      timestamp: evaluation.timestamp,
      scores: evaluation.scores,
      overallScore: evaluation.overallScore,
      feedback: evaluation.feedback,
      suggestions: evaluation.suggestions
    });

    await newEvaluation.save();

    // Update session with latest evaluation
    await Session.findByIdAndUpdate(context.sessionId, {
      $push: { evaluations: newEvaluation._id },
      $set: { lastEvaluationScore: evaluation.overallScore }
    });
  }

  static async _normalizeDiagram(diagram, type) {
    if (type === 'mermaid') {
      return mermaidToReactFlow(diagram.code);
    }
    return diagram;
  }

  static _calculateOverallScore(scores) {
    return Object.entries(scores).reduce((total, [criterion, score]) => {
      return total + (score * this.evaluationCriteria[criterion].weight);
    }, 0);
  }
}

module.exports = DiagramEvaluationService;
