const PatternRegistry = require('./PatternRegistry');
const logger = require('../../../utils/logger');

class PatternAnalyzer {
  constructor() {
    this.registry = new PatternRegistry();
  }

  analyzePatterns(diagram) {
    try {
      // Get basic pattern detection results
      const patternResults = this.registry.detectPatterns(diagram);

      // Enhance with detailed analysis
      return {
        ...patternResults,
        analysis: this._performDetailedAnalysis(diagram, patternResults),
        recommendations: this._generateRecommendations(diagram, patternResults),
        qualityMetrics: this._calculateQualityMetrics(diagram, patternResults)
      };
    } catch (error) {
      logger.error('Error in pattern analysis:', error);
      throw new Error('Pattern analysis failed');
    }
  }

  _performDetailedAnalysis(diagram, patternResults) {
    const analysis = {
      strengths: [],
      weaknesses: [],
      risks: [],
      opportunities: []
    };

    // Analyze detected patterns
    for (const pattern of patternResults.detected) {
      const strengthsAndWeaknesses = this._analyzePatternImplementation(diagram, pattern);
      analysis.strengths.push(...strengthsAndWeaknesses.strengths);
      analysis.weaknesses.push(...strengthsAndWeaknesses.weaknesses);
    }

    // Analyze missing patterns
    for (const pattern of patternResults.missing) {
      const risks = this._analyzePatternGap(diagram, pattern);
      analysis.risks.push(...risks);
    }

    // Identify improvement opportunities
    analysis.opportunities = this._identifyOpportunities(diagram, patternResults);

    return analysis;
  }

  _analyzePatternImplementation(diagram, pattern) {
    const analysis = {
      strengths: [],
      weaknesses: []
    };

    switch (pattern.id) {
      case 'loadBalancing':
        this._analyzeLBImplementation(diagram, pattern, analysis);
        break;
      case 'caching':
        this._analyzeCachingImplementation(diagram, pattern, analysis);
        break;
      case 'messageQueue':
        this._analyzeQueueImplementation(diagram, pattern, analysis);
        break;
    }

    return analysis;
  }

  _analyzeLBImplementation(diagram, pattern, analysis) {
    const lbNodes = diagram.nodes.filter(n => n.type === 'loadBalancer');
    const serviceNodes = diagram.nodes.filter(n => n.type === 'service');

    if (lbNodes.length === 1 && serviceNodes.length > 3) {
      analysis.weaknesses.push('Single load balancer might become a bottleneck');
    }

    if (serviceNodes.length >= 2) {
      analysis.strengths.push('Multiple services enable horizontal scaling');
    }

    // Check for health check connections
    const hasHealthChecks = diagram.edges.some(e => 
      e.data?.properties?.includes('healthCheck')
    );
    
    if (!hasHealthChecks) {
      analysis.weaknesses.push('Missing health check mechanisms');
    }
  }

  _analyzeCachingImplementation(diagram, pattern, analysis) {
    const cacheNodes = diagram.nodes.filter(n => n.type === 'cache');
    const dbNodes = diagram.nodes.filter(n => n.type === 'database');

    if (cacheNodes.length === 1 && dbNodes.length > 0) {
      const hasDirectDbConnections = diagram.edges.some(e => {
        const source = diagram.nodes.find(n => n.id === e.source);
        const target = diagram.nodes.find(n => n.id === e.target);
        return source?.type === 'service' && target?.type === 'database';
      });

      if (hasDirectDbConnections) {
        analysis.weaknesses.push('Some services bypass cache layer');
      }
    }

    const distributedCache = cacheNodes.length > 1;
    if (distributedCache) {
      analysis.strengths.push('Distributed caching improves reliability');
    }
  }

  _analyzeQueueImplementation(diagram, pattern, analysis) {
    const queueNodes = diagram.nodes.filter(n => n.type === 'queue');
    const serviceNodes = diagram.nodes.filter(n => n.type === 'service');

    const hasDeadLetterQueue = queueNodes.some(n => 
      n.data?.properties?.includes('deadLetter')
    );

    if (!hasDeadLetterQueue) {
      analysis.weaknesses.push('Missing dead letter queue for error handling');
    }

    const hasMonitoring = queueNodes.some(n => 
      n.data?.properties?.includes('monitoring')
    );

    if (!hasMonitoring) {
      analysis.weaknesses.push('Queue monitoring not implemented');
    }
  }

  _analyzePatternGap(diagram, missingPattern) {
    const risks = [];

    switch (missingPattern.id) {
      case 'loadBalancing':
        if (diagram.nodes.filter(n => n.type === 'service').length > 1) {
          risks.push('Multiple services without load balancing may lead to uneven load distribution');
        }
        break;

      case 'caching':
        if (diagram.nodes.some(n => n.type === 'database')) {
          risks.push('Direct database access without caching may cause performance bottlenecks');
        }
        break;

      case 'messageQueue':
        const serviceCount = diagram.nodes.filter(n => n.type === 'service').length;
        if (serviceCount > 2) {
          risks.push('Multiple services communicating directly may lead to tight coupling');
        }
        break;
    }

    return risks;
  }

  _identifyOpportunities(diagram, patternResults) {
    const opportunities = [];
    const nodeTypes = new Set(diagram.nodes.map(n => n.type));

    // Identify potential improvements based on current architecture
    if (nodeTypes.has('database') && !nodeTypes.has('cache')) {
      opportunities.push({
        pattern: 'caching',
        description: 'Add caching layer to improve database performance',
        priority: 'HIGH'
      });
    }

    if (nodeTypes.has('service') && diagram.nodes.filter(n => n.type === 'service').length > 1) {
      if (!nodeTypes.has('loadBalancer')) {
        opportunities.push({
          pattern: 'loadBalancing',
          description: 'Implement load balancing for better scalability',
          priority: 'HIGH'
        });
      }
    }

    const serviceToServiceConnections = diagram.edges.filter(e => {
      const source = diagram.nodes.find(n => n.id === e.source);
      const target = diagram.nodes.find(n => n.id === e.target);
      return source?.type === 'service' && target?.type === 'service';
    });

    if (serviceToServiceConnections.length > 2 && !nodeTypes.has('queue')) {
      opportunities.push({
        pattern: 'messageQueue',
        description: 'Add message queue to decouple services',
        priority: 'MEDIUM'
      });
    }

    return opportunities;
  }

  _calculateQualityMetrics(diagram, patternResults) {
    return {
      patternCoverage: this._calculatePatternCoverage(patternResults),
      implementationQuality: this._calculateImplementationQuality(patternResults),
      architecturalFitness: this._calculateArchitecturalFitness(diagram, patternResults)
    };
  }

  _calculatePatternCoverage(patternResults) {
    const totalPatterns = patternResults.detected.length + patternResults.missing.length;
    return (patternResults.detected.length / totalPatterns) * 100;
  }

  _calculateImplementationQuality(patternResults) {
    if (patternResults.detected.length === 0) return 0;
    
    const totalScore = patternResults.detected.reduce((sum, p) => sum + p.score, 0);
    return totalScore / patternResults.detected.length;
  }

  _calculateArchitecturalFitness(diagram, patternResults) {
    // Base score starts at 100 and gets reduced for architectural issues
    let score = 100;

    // Analyze service distribution
    const serviceCount = diagram.nodes.filter(n => n.type === 'service').length;
    if (serviceCount > 3 && !patternResults.detected.some(p => p.id === 'loadBalancing')) {
      score -= 20;
    }

    // Analyze data access patterns
    const hasDatabase = diagram.nodes.some(n => n.type === 'database');
    if (hasDatabase && !patternResults.detected.some(p => p.id === 'caching')) {
      score -= 15;
    }

    // Analyze service coupling
    const serviceToServiceEdges = diagram.edges.filter(e => {
      const source = diagram.nodes.find(n => n.id === e.source);
      const target = diagram.nodes.find(n => n.id === e.target);
      return source?.type === 'service' && target?.type === 'service';
    });

    if (serviceToServiceEdges.length > 2 && !patternResults.detected.some(p => p.id === 'messageQueue')) {
      score -= 15;
    }

    return Math.max(0, score);
  }
}

module.exports = PatternAnalyzer;