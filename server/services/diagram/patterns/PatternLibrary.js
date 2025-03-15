const PatternRegistry = require('./PatternRegistry');

class PatternLibrary {
  constructor() {
    this.registry = new PatternRegistry();
  }

  getPatternSuggestions(nodes, edges) {
    const suggestions = [];
    const detectedPatterns = this.detectPatterns(nodes, edges);
    const missingPatterns = this._identifyMissingPatterns(nodes, edges);
    
    // Analyze existing pattern implementations
    for (const pattern of detectedPatterns) {
      const analysis = this.analyzePatternImplementation(pattern, nodes, edges);
      if (analysis.improvements.length > 0) {
        suggestions.push({
          type: 'improvement',
          pattern: pattern.id,
          suggestions: analysis.improvements,
          priority: analysis.priority
        });
      }
    }

    return this.prioritizeSuggestions(suggestions);
  }

  analyzePatternImplementation(pattern, nodes, edges) {
    const analysis = {
      improvements: [],
      priority: 'low'
    };

    switch (pattern.name.toLowerCase()) {
      case 'caching':
        this._analyzeCachingPattern(nodes, edges, analysis);
        break;
      case 'message queue':
        this._analyzeQueuePattern(nodes, edges, analysis);
        break;
      case 'microservices':
        this._analyzeMicroservicesPattern(nodes, edges, analysis);
        break;
    }

    return analysis;
  }

  _analyzeCachingPattern(nodes, edges, analysis) {
    const cacheNodes = nodes.filter(n => n.type === 'cache');
    const dbNodes = nodes.filter(n => n.type === 'database');

    if (cacheNodes.length === 1 && dbNodes.length > 1) {
      analysis.improvements.push({
        type: 'optimization',
        details: 'Consider distributed caching for multiple databases',
        priority: 'medium'
      });
    }

    // Check cache connections
    const cacheConnections = edges.filter(e => 
      nodes.find(n => n.id === e.source && n.type === 'cache') ||
      nodes.find(n => n.id === e.target && n.type === 'cache')
    );

    if (cacheConnections.length < dbNodes.length) {
      analysis.improvements.push({
        type: 'missing_components',
        details: 'Not all database operations are cached',
        priority: 'high'
      });
    }
  }

  _analyzeQueuePattern(nodes, edges, analysis) {
    const queueNodes = nodes.filter(n => n.type === 'queue');
    const serviceNodes = nodes.filter(n => n.type === 'service');

    // Check for dead letter queue
    const hasDeadLetterQueue = queueNodes.some(n => 
      n.data?.properties?.includes('deadLetter')
    );

    if (!hasDeadLetterQueue) {
      analysis.improvements.push({
        type: 'missing_components',
        details: 'Add dead letter queue for error handling',
        priority: 'high'
      });
    }

    // Check queue connections
    if (queueNodes.length === 1 && serviceNodes.length > 3) {
      analysis.improvements.push({
        type: 'optimization',
        details: 'Consider multiple queues for better load distribution',
        priority: 'medium'
      });
    }
  }

  _analyzeMicroservicesPattern(nodes, edges, analysis) {
    const serviceNodes = nodes.filter(n => n.type === 'service');
    const lbNodes = nodes.filter(n => n.type === 'loadBalancer');

    if (serviceNodes.length > 2 && lbNodes.length === 0) {
      analysis.improvements.push({
        type: 'missing_components',
        details: 'Add load balancer for better request distribution',
        priority: 'high'
      });
    }

    // Check service isolation
    const directServiceConnections = edges.filter(e =>
      serviceNodes.find(n => n.id === e.source) &&
      serviceNodes.find(n => n.id === e.target)
    );

    if (directServiceConnections.length > serviceNodes.length) {
      analysis.improvements.push({
        type: 'optimization',
        details: 'Consider using API Gateway or Message Queue for service communication',
        priority: 'medium'
      });
    }
  }

  prioritizeSuggestions(suggestions) {
    return suggestions.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });
  }

  detectPatterns(nodes, edges) {
    return this.registry.detectPatterns({ nodes, edges });
  }

  _identifyMissingPatterns(nodes, edges) {
    // Implementation of missing pattern identification
    return [];
  }
}

module.exports = PatternLibrary;