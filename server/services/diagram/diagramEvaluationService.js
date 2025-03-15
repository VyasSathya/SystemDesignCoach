const DiagramAnalyzer = require('./diagramAnalyzer');
const PatternLibrary = require('./patterns/PatternLibrary');
const { diagramStructure } = require('../../../data/diagram_structure');

class DiagramEvaluationService {
  constructor() {
    this.analyzer = new DiagramAnalyzer();
    this.patternLibrary = new PatternLibrary();
  }

  async evaluateDiagram(diagram, type, context) {
    const normalizedDiagram = this._normalizeDiagram(diagram, type);
    
    const evaluation = {
      diagramId: diagram.id,
      timestamp: Date.now(),
      scores: {},
      analysis: {},
      recommendations: []
    };

    // Evaluate different criteria
    const criteria = this._getCriteriaForType(type);
    for (const criterion of criteria) {
      evaluation.scores[criterion] = await this._evaluateCriterion(
        normalizedDiagram, 
        criterion, 
        this._getCriterionConfig(criterion),
        context
      );
    }

    // Analyze components and patterns
    evaluation.analysis = {
      components: this._analyzeComponents(normalizedDiagram),
      patterns: this._identifyPatterns(normalizedDiagram),
      issues: await this.analyzer.analyzeDiagram(
        normalizedDiagram.nodes, 
        normalizedDiagram.edges, 
        type
      )
    };

    // Calculate overall score
    evaluation.scores.overall = this._calculateOverallScore(evaluation.scores);

    // Generate recommendations
    evaluation.recommendations = this._generateRecommendations(
      evaluation.analysis,
      evaluation.scores,
      context
    );

    // Store evaluation results
    await this._storeEvaluation(evaluation, context);

    return evaluation;
  }

  _getCriteriaForType(type) {
    const commonCriteria = ['scalability', 'reliability', 'security'];
    
    switch (type) {
      case 'system':
        return [...commonCriteria, 'performance', 'maintainability'];
      case 'sequence':
        return [...commonCriteria, 'consistency', 'communication'];
      default:
        return commonCriteria;
    }
  }

  _getCriterionConfig(criterion) {
    const configs = {
      scalability: {
        weight: 0.25,
        checks: ['loadBalancing', 'horizontalScaling', 'caching']
      },
      reliability: {
        weight: 0.2,
        checks: ['redundancy', 'failover', 'errorHandling']
      },
      security: {
        weight: 0.25,
        checks: ['authentication', 'authorization', 'dataEncryption']
      },
      performance: {
        weight: 0.15,
        checks: ['responseTime', 'throughput', 'resourceUtilization']
      },
      maintainability: {
        weight: 0.15,
        checks: ['modularity', 'coupling', 'cohesion']
      }
    };

    return configs[criterion] || { weight: 0.1, checks: [] };
  }

  async _evaluateCriterion(diagram, criterion, config, context) {
    const score = {
      value: 0,
      details: [],
      improvements: []
    };

    for (const check of config.checks) {
      const checkResult = await this._performCheck(diagram, check, context);
      score.value += checkResult.score * config.weight;
      score.details.push(checkResult);
      
      if (checkResult.improvements) {
        score.improvements.push(...checkResult.improvements);
      }
    }

    return score;
  }

  _analyzeComponents(diagram) {
    return {
      count: {
        services: diagram.nodes.filter(n => n.type === 'service').length,
        databases: diagram.nodes.filter(n => n.type === 'database').length,
        queues: diagram.nodes.filter(n => n.type === 'queue').length,
        caches: diagram.nodes.filter(n => n.type === 'cache').length,
        gateways: diagram.nodes.filter(n => n.type === 'gateway').length,
        loadBalancers: diagram.nodes.filter(n => n.type === 'loadBalancer').length
      },
      relationships: this._analyzeRelationships(diagram.nodes, diagram.edges),
      complexity: this._calculateComplexity(diagram)
    };
  }

  _identifyPatterns(diagram) {
    return this.patternLibrary.detectPatterns({
      nodes: diagram.nodes,
      edges: diagram.edges
    });
  }

  _calculateOverallScore(scores) {
    const weights = {
      scalability: 0.25,
      reliability: 0.2,
      security: 0.25,
      performance: 0.15,
      maintainability: 0.15
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (const [criterion, score] of Object.entries(scores)) {
      if (criterion !== 'overall') {
        const weight = weights[criterion] || 0.1;
        totalScore += score.value * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  _normalizeDiagram(diagram, type) {
    const structure = diagramStructure[type];
    if (!structure) {
      throw new Error(`Unsupported diagram type: ${type}`);
    }

    return {
      ...diagram,
      nodes: diagram.nodes.map(node => ({
        ...node,
        type: node.type.toLowerCase()
      })),
      edges: diagram.edges.map(edge => ({
        ...edge,
        type: edge.type?.toLowerCase() || 'default'
      }))
    };
  }

  async _storeEvaluation(evaluation, context) {
    try {
      // Store evaluation in database
      const Diagram = require('../../models/Diagram');
      await Diagram.findOneAndUpdate(
        { diagramId: evaluation.diagramId },
        {
          $set: { currentScore: evaluation.scores.overall },
          $push: { 
            snapshots: {
              timestamp: evaluation.timestamp,
              scores: evaluation.scores,
              analysis: evaluation.analysis
            }
          }
        },
        { upsert: true }
      );
    } catch (error) {
      console.error('Failed to store evaluation:', error);
    }
  }

  _analyzeRelationships(nodes, edges) {
    return {
      connectivity: this._calculateConnectivity(nodes, edges),
      dependencies: this._analyzeDependencies(nodes, edges),
      bottlenecks: this._identifyBottlenecks(nodes, edges)
    };
  }

  _calculateComplexity(diagram) {
    const nodeComplexity = diagram.nodes.length;
    const edgeComplexity = diagram.edges.length;
    const patternComplexity = this._identifyPatterns(diagram).length;

    return {
      value: (nodeComplexity * 0.4) + (edgeComplexity * 0.4) + (patternComplexity * 0.2),
      details: {
        nodes: nodeComplexity,
        edges: edgeComplexity,
        patterns: patternComplexity
      }
    };
  }
}

module.exports = DiagramEvaluationService;
