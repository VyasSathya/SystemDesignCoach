const PatternRegistry = require('./patterns/PatternRegistry');
const DiagramAnalyzer = require('./diagramAnalyzer');

class DiagramScoringService {
  constructor() {
    this.patternRegistry = new PatternRegistry();
    this.analyzer = new DiagramAnalyzer();
    
    this.scoringCriteria = {
      patterns: {
        weight: 0.3,
        criteria: {
          scalability: { weight: 0.4 },
          reliability: { weight: 0.3 },
          security: { weight: 0.2 },
          performance: { weight: 0.1 }
        }
      },
      complexity: {
        weight: 0.2,
        optimal: {
          nodes: { min: 3, max: 15 },
          edges: { min: 2, max: 20 },
          depth: { min: 2, max: 4 }
        }
      },
      bestPractices: {
        weight: 0.3,
        checks: [
          'hasLoadBalancer',
          'hasCaching',
          'hasErrorHandling',
          'hasAuthentication',
          'hasRedundancy'
        ]
      },
      analysis: {
        weight: 0.2,
        aspects: [
          'securityConcerns',
          'scalabilityIssues',
          'reliabilityRisks',
          'performanceBottlenecks'
        ]
      }
    };
  }

  async evaluateAndScore(diagram) {
    const analysis = await this.analyzer.analyzeDiagram(
      diagram.nodes, 
      diagram.edges, 
      diagram.type
    );

    const detectedPatterns = this.patternRegistry.detectPatterns(diagram);
    
    const scores = {
      patterns: this._scorePatterns(detectedPatterns),
      complexity: this._scoreComplexity(diagram),
      bestPractices: this._scoreBestPractices(diagram, detectedPatterns),
      analysis: this._scoreAnalysis(analysis),
      total: 0
    };

    scores.total = this._calculateTotalScore(scores);

    return {
      ...scores,
      details: {
        patterns: detectedPatterns,
        analysis: analysis,
        recommendations: this._generateRecommendations(scores, diagram)
      }
    };
  }

  _scorePatterns(detectedPatterns) {
    const categoryScores = {};
    let totalScore = 0;

    for (const pattern of detectedPatterns) {
      const category = pattern.category;
      const categoryWeight = this.scoringCriteria.patterns.criteria[category]?.weight || 0;
      
      categoryScores[category] = categoryScores[category] || 0;
      categoryScores[category] += pattern.score;
    }

    // Normalize category scores and apply weights
    for (const [category, score] of Object.entries(categoryScores)) {
      const weight = this.scoringCriteria.patterns.criteria[category].weight;
      totalScore += score * weight;
    }

    return totalScore * this.scoringCriteria.patterns.weight;
  }

  _scoreComplexity(diagram) {
    const { nodes, edges } = diagram;
    const optimal = this.scoringCriteria.complexity.optimal;
    
    const nodeScore = this._calculateRangeScore(
      nodes.length,
      optimal.nodes.min,
      optimal.nodes.max
    );

    const edgeScore = this._calculateRangeScore(
      edges.length,
      optimal.edges.min,
      optimal.edges.max
    );

    const depth = this._calculateGraphDepth(diagram);
    const depthScore = this._calculateRangeScore(
      depth,
      optimal.depth.min,
      optimal.depth.max
    );

    const complexityScore = (nodeScore + edgeScore + depthScore) / 3;
    return complexityScore * this.scoringCriteria.complexity.weight;
  }

  _scoreBestPractices(diagram, detectedPatterns) {
    const checks = this.scoringCriteria.bestPractices.checks;
    let score = 0;

    for (const check of checks) {
      switch (check) {
        case 'hasLoadBalancer':
          score += diagram.nodes.some(n => n.type === 'loadBalancer') ? 1 : 0;
          break;
        case 'hasCaching':
          score += diagram.nodes.some(n => n.type === 'cache') ? 1 : 0;
          break;
        case 'hasErrorHandling':
          score += detectedPatterns.some(p => p.id === 'circuitBreaker') ? 1 : 0;
          break;
        case 'hasAuthentication':
          score += detectedPatterns.some(p => p.id === 'authenticationLayer') ? 1 : 0;
          break;
        case 'hasRedundancy':
          score += detectedPatterns.some(p => p.id === 'failover') ? 1 : 0;
          break;
      }
    }

    return (score / checks.length) * this.scoringCriteria.bestPractices.weight;
  }

  _scoreAnalysis(analysis) {
    const aspects = this.scoringCriteria.analysis.aspects;
    let score = 0;

    for (const aspect of aspects) {
      const issues = analysis.criticalIssues.filter(issue => 
        issue.category === aspect
      );
      
      // More issues = lower score
      const aspectScore = Math.max(0, 1 - (issues.length * 0.2));
      score += aspectScore;
    }

    return (score / aspects.length) * this.scoringCriteria.analysis.weight;
  }

  _calculateRangeScore(value, min, max) {
    if (value < min) {
      return Math.max(0, 1 - ((min - value) / min));
    }
    if (value > max) {
      return Math.max(0, 1 - ((value - max) / max));
    }
    return 1;
  }

  _calculateGraphDepth(diagram) {
    const visited = new Set();
    const depths = new Map();

    const calculateNodeDepth = (nodeId, depth = 0) => {
      if (visited.has(nodeId)) {
        return depths.get(nodeId);
      }

      visited.add(nodeId);
      depths.set(nodeId, depth);

      const outgoingEdges = diagram.edges.filter(e => e.source === nodeId);
      for (const edge of outgoingEdges) {
        const childDepth = calculateNodeDepth(edge.target, depth + 1);
        depths.set(nodeId, Math.max(depths.get(nodeId), childDepth));
      }

      return depths.get(nodeId);
    };

    // Find root nodes (nodes with no incoming edges)
    const rootNodes = diagram.nodes.filter(node =>
      !diagram.edges.some(edge => edge.target === node.id)
    );

    // Calculate max depth from each root
    let maxDepth = 0;
    for (const root of rootNodes) {
      const depth = calculateNodeDepth(root.id);
      maxDepth = Math.max(maxDepth, depth);
    }

    return maxDepth;
  }

  _calculateTotalScore(scores) {
    return Object.values(scores).reduce((total, score) => 
      typeof score === 'number' ? total + score : total, 
      0
    );
  }

  _generateRecommendations(scores, diagram) {
    const recommendations = [];

    // Pattern-based recommendations
    if (scores.patterns < 0.6) {
      const missingPatterns = this._findMissingCriticalPatterns(diagram);
      recommendations.push(...missingPatterns.map(pattern => ({
        type: 'pattern',
        priority: 'high',
        message: `Consider implementing ${pattern.name} pattern`,
        details: pattern.description
      })));
    }

    // Complexity recommendations
    if (scores.complexity < 0.5) {
      recommendations.push({
        type: 'complexity',
        priority: 'medium',
        message: 'Diagram complexity needs optimization',
        details: 'Consider simplifying the architecture or breaking it into smaller components'
      });
    }

    // Best practices recommendations
    if (scores.bestPractices < 0.7) {
      const missingPractices = this._findMissingBestPractices(diagram);
      recommendations.push(...missingPractices.map(practice => ({
        type: 'bestPractice',
        priority: 'high',
        message: `Missing: ${practice}`,
        details: `Implement ${practice} to improve architecture robustness`
      })));
    }

    return recommendations;
  }

  _findMissingCriticalPatterns(diagram) {
    const criticalPatterns = ['loadBalancing', 'caching', 'circuitBreaker'];
    const detectedPatterns = this.patternRegistry.detectPatterns(diagram);
    
    return criticalPatterns.filter(patternId => 
      !detectedPatterns.some(p => p.id === patternId)
    ).map(patternId => this.patternRegistry.getPattern(patternId));
  }

  _findMissingBestPractices(diagram) {
    return this.scoringCriteria.bestPractices.checks.filter(check => {
      switch (check) {
        case 'hasLoadBalancer':
          return !diagram.nodes.some(n => n.type === 'loadBalancer');
        case 'hasCaching':
          return !diagram.nodes.some(n => n.type === 'cache');
        case 'hasErrorHandling':
          return !diagram.nodes.some(n => n.data?.metadata?.includes('errorHandling'));
        case 'hasAuthentication':
          return !diagram.nodes.some(n => n.data?.metadata?.includes('auth'));
        case 'hasRedundancy':
          return !this._hasRedundancy(diagram);
      }
    });
  }

  _hasRedundancy(diagram) {
    const serviceCounts = {};
    for (const node of diagram.nodes) {
      serviceCounts[node.type] = (serviceCounts[node.type] || 0) + 1;
    }
    return Object.values(serviceCounts).some(count => count > 1);
  }
}

module.exports = DiagramScoringService;