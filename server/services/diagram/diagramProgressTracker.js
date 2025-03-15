const DiagramScoringService = require('./diagramScoringService');
const { diagramStructure } = require('../../../data/diagram_structure');

class DiagramProgressTracker {
  constructor() {
    this.scoringService = new DiagramScoringService();
  }

  async trackProgress(sessionId, diagramId, currentDiagram) {
    const snapshot = await this._createSnapshot(currentDiagram);
    await this._saveSnapshot(sessionId, diagramId, snapshot);
    
    const analysis = await this._analyzeProgress(sessionId, diagramId);
    
    return {
      currentSnapshot: snapshot,
      progress: analysis.progress,
      trends: analysis.trends,
      nextSteps: analysis.recommendations
    };
  }

  async _createSnapshot(diagram) {
    const scores = await this.scoringService.evaluateAndScore(diagram);
    
    return {
      timestamp: Date.now(),
      scores: scores,
      componentCounts: this._countComponents(diagram),
      complexity: this._calculateComplexity(diagram),
      patterns: this._identifyPatterns(diagram)
    };
  }

  _countComponents(diagram) {
    const counts = {};
    diagram.nodes.forEach(node => {
      counts[node.type] = (counts[node.type] || 0) + 1;
    });
    return counts;
  }

  _calculateComplexity(diagram) {
    return {
      nodes: diagram.nodes.length,
      edges: diagram.edges.length,
      density: diagram.edges.length / (diagram.nodes.length || 1),
      avgConnections: diagram.nodes.reduce((acc, node) => {
        const connections = diagram.edges.filter(e => 
          e.source === node.id || e.target === node.id
        ).length;
        return acc + connections;
      }, 0) / (diagram.nodes.length || 1)
    };
  }

  _identifyPatterns(diagram) {
    const patterns = {
      loadBalancing: false,
      caching: false,
      messageQueue: false,
      apiGateway: false,
      serviceDiscovery: false,
      circuitBreaker: false
    };

    // Check for load balancing pattern
    patterns.loadBalancing = diagram.nodes.some(n => n.type === 'loadBalancer');

    // Check for caching pattern
    patterns.caching = diagram.nodes.some(n => n.type === 'cache');

    // Check for message queue pattern
    patterns.messageQueue = diagram.nodes.some(n => n.type === 'queue');

    // Check for API Gateway pattern
    patterns.apiGateway = diagram.nodes.some(n => 
      n.type === 'apiGateway' || 
      n.data?.label?.toLowerCase().includes('api gateway')
    );

    // Check for service discovery
    patterns.serviceDiscovery = diagram.nodes.some(n => 
      n.type === 'serviceDiscovery' || 
      n.data?.label?.toLowerCase().includes('service discovery')
    );

    // Check for circuit breaker pattern
    patterns.circuitBreaker = diagram.edges.some(e => 
      e.data?.type === 'circuitBreaker' || 
      e.data?.label?.toLowerCase().includes('circuit breaker')
    );

    return patterns;
  }

  async _saveSnapshot(sessionId, diagramId, snapshot) {
    // Assuming we have a DiagramModel in the database
    const DiagramModel = require('../../models/Diagram');
    
    await DiagramModel.updateOne(
      { sessionId, diagramId },
      { 
        $push: { 
          snapshots: snapshot 
        },
        $set: {
          lastUpdated: Date.now(),
          currentScore: snapshot.scores.overall
        }
      },
      { upsert: true }
    );
  }

  async _analyzeProgress(sessionId, diagramId) {
    const DiagramModel = require('../../models/Diagram');
    const diagram = await DiagramModel.findOne({ sessionId, diagramId });
    
    if (!diagram || !diagram.snapshots || diagram.snapshots.length < 2) {
      return {
        progress: {},
        trends: {},
        recommendations: []
      };
    }

    const snapshots = diagram.snapshots;
    const latest = snapshots[snapshots.length - 1];
    const previous = snapshots[snapshots.length - 2];

    const progress = {
      scoreImprovement: latest.scores.overall - previous.scores.overall,
      newPatterns: this._getNewPatterns(previous.patterns, latest.patterns),
      complexityChange: this._getComplexityChange(previous.complexity, latest.complexity)
    };

    const trends = this._calculateTrends(snapshots);

    const recommendations = this._generateRecommendations(latest, trends);

    return { progress, trends, recommendations };
  }

  _getNewPatterns(previous, current) {
    const newPatterns = [];
    for (const [pattern, implemented] of Object.entries(current)) {
      if (implemented && !previous[pattern]) {
        newPatterns.push(pattern);
      }
    }
    return newPatterns;
  }

  _getComplexityChange(previous, current) {
    return {
      nodes: current.nodes - previous.nodes,
      edges: current.edges - previous.edges,
      density: current.density - previous.density,
      avgConnections: current.avgConnections - previous.avgConnections
    };
  }

  _calculateTrends(snapshots) {
    const trends = {
      scores: {},
      patterns: {},
      complexity: {}
    };

    // Calculate score trends
    trends.scores = this._calculateScoreTrends(snapshots);

    // Calculate pattern adoption trends
    trends.patterns = this._calculatePatternTrends(snapshots);

    // Calculate complexity trends
    trends.complexity = this._calculateComplexityTrends(snapshots);

    return trends;
  }

  _calculateScoreTrends(snapshots) {
    const categories = ['overall', 'scalability', 'reliability', 'security', 'maintainability'];
    const trends = {};

    categories.forEach(category => {
      const scores = snapshots.map(s => s.scores[category]);
      trends[category] = this._calculateTrendMetrics(scores);
    });

    return trends;
  }

  _calculatePatternTrends(snapshots) {
    const patterns = {};
    const latestSnapshot = snapshots[snapshots.length - 1];

    Object.keys(latestSnapshot.patterns).forEach(pattern => {
      const adoption = snapshots.map(s => s.patterns[pattern]);
      patterns[pattern] = {
        adopted: adoption[adoption.length - 1],
        adoptionSnapshot: adoption.findIndex(a => a === true)
      };
    });

    return patterns;
  }

  _calculateComplexityTrends(snapshots) {
    const metrics = ['nodes', 'edges', 'density', 'avgConnections'];
    const trends = {};

    metrics.forEach(metric => {
      const values = snapshots.map(s => s.complexity[metric]);
      trends[metric] = this._calculateTrendMetrics(values);
    });

    return trends;
  }

  _calculateTrendMetrics(values) {
    const recent = values.slice(-3);
    return {
      current: values[values.length - 1],
      change: values[values.length - 1] - values[0],
      recentTrend: recent[2] - recent[0],
      volatility: this._calculateVolatility(values)
    };
  }

  _calculateVolatility(values) {
    if (values.length < 2) return 0;
    let sumSquaredDiff = 0;
    for (let i = 1; i < values.length; i++) {
      sumSquaredDiff += Math.pow(values[i] - values[i-1], 2);
    }
    return Math.sqrt(sumSquaredDiff / (values.length - 1));
  }

  _generateRecommendations(latest, trends) {
    const recommendations = [];

    // Check for negative trends
    Object.entries(trends.scores).forEach(([category, trend]) => {
      if (trend.recentTrend < 0) {
        recommendations.push({
          type: 'warning',
          category,
          message: `${category} score has been declining. Consider reviewing recent changes.`
        });
      }
    });

    // Check for missing important patterns
    Object.entries(latest.patterns).forEach(([pattern, implemented]) => {
      if (!implemented) {
        recommendations.push({
          type: 'suggestion',
          category: 'patterns',
          message: `Consider implementing ${pattern} pattern to improve system design.`
        });
      }
    });

    // Check complexity trends
    if (trends.complexity.density.recentTrend > 0.2) {
      recommendations.push({
        type: 'warning',
        category: 'complexity',
        message: 'System complexity is increasing rapidly. Consider refactoring for better maintainability.'
      });
    }

    return recommendations;
  }
}

module.exports = DiagramProgressTracker;