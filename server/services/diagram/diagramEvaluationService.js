const DiagramAnalyzer = require('./diagramAnalyzer');
const PatternLibrary = require('./patterns/PatternLibrary');
const { diagramStructure } = require('../../data/diagram_structure');
const WorkbookService = require('./WorkbookService');

class DiagramEvaluationService {
  constructor() {
    this.analyzer = new DiagramAnalyzer();
    this.workbookService = WorkbookService;
    this.patternLibrary = new PatternLibrary();
  }

  async evaluateDiagram(diagram, type, context) {
    const normalizedDiagram = this._normalizeDiagram(diagram, type);
    
    const evaluation = {
      diagramId: diagram.id,
      timestamp: Date.now(),
      scores: {},
      analysis: {},
      recommendations: [],
      saveStatus: context.saveStatus
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

    // Enhanced analysis with save status awareness
    evaluation.analysis = {
      components: this._analyzeComponents(normalizedDiagram),
      patterns: this._identifyPatterns(normalizedDiagram),
      issues: await this.analyzer.analyzeDiagram(
        normalizedDiagram.nodes, 
        normalizedDiagram.edges, 
        type
      ),
      saveState: {
        lastSaved: context.lastSaved,
        hasUnsavedChanges: context.saveStatus === 'unsaved'
      }
    };

    // Store evaluation results
    await this.workbookService.updateDiagramEvaluation(
      context.sessionId,
      evaluation
    );

    return evaluation;
  }

  _getCriteriaForType(type) {
    return ['complexity', 'patterns', 'bestPractices'];
  }

  _getCriterionConfig(criterion) {
    return {
      weight: 1,
      checks: []
    };
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

  _analyzeRelationships(nodes, edges) {
    return {
      connectivity: this._calculateConnectivity(nodes, edges),
      dependencies: this._analyzeDependencies(nodes, edges),
      bottlenecks: this._identifyBottlenecks(nodes, edges)
    };
  }

  _calculateConnectivity(nodes, edges) {
    return edges.length / (nodes.length * (nodes.length - 1));
  }

  _analyzeDependencies(nodes, edges) {
    return {
      count: edges.length,
      density: edges.length / nodes.length
    };
  }

  _identifyBottlenecks(nodes, edges) {
    return nodes
      .filter(node => {
        const incomingEdges = edges.filter(e => e.target === node.id);
        const outgoingEdges = edges.filter(e => e.source === node.id);
        return incomingEdges.length > 2 && outgoingEdges.length === 1;
      })
      .map(node => node.id);
  }

  _calculateComplexity(diagram) {
    return {
      cyclomatic: this._calculateCyclomaticComplexity(diagram),
      cognitive: this._calculateCognitiveComplexity(diagram)
    };
  }

  _calculateCyclomaticComplexity(diagram) {
    return diagram.edges.length - diagram.nodes.length + 2;
  }

  _calculateCognitiveComplexity(diagram) {
    return diagram.edges.length * 0.5 + diagram.nodes.length * 0.3;
  }
}

module.exports = DiagramEvaluationService;

