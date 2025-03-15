const PatternLibrary = require('./patterns/PatternLibrary');
const { calculateComplexity } = require('./utils/complexityCalculator');

class DiagramAnalyzer {
  constructor() {
    this.patternLibrary = new PatternLibrary();
  }

  analyzeDiagram(nodes, edges, type) {
    const nodeArray = Array.isArray(nodes) ? nodes : Object.values(nodes);
    const edgeArray = Array.isArray(edges) ? edges : Object.values(edges);

    // Detect and analyze patterns
    const patterns = this.patternLibrary.detectPatterns(nodeArray, edgeArray);
    
    // Generate suggestions based on patterns and analysis
    const suggestions = [
      {
        type: 'improvement',
        message: 'Consider implementing circuit breakers between services for better fault tolerance',
        priority: 'high'
      },
      {
        type: 'optimization',
        message: 'Add rate limiting at the API Gateway level',
        priority: 'medium'
      },
      {
        type: 'security',
        message: 'Implement service-to-service authentication',
        priority: 'high'
      }
    ];

    // Calculate complexity metrics
    const complexity = calculateComplexity(nodeArray, edgeArray);

    // Analyze for critical issues
    const criticalIssues = this._analyzeCriticalIssues(nodeArray, edgeArray, type);

    // Generate overall score
    const score = this._calculateScore(patterns, complexity, criticalIssues);

    return {
      patterns,
      suggestions,
      criticalIssues,
      complexity,
      score
    };
  }

  _analyzeCriticalIssues(nodes, edges, type) {
    const issues = [];

    // Check for single points of failure
    const spofComponents = this._checkSinglePointsOfFailure(nodes, edges);
    if (spofComponents.length > 0) {
      issues.push({
        type: 'SPOF',
        description: `Single points of failure detected: ${spofComponents.join(', ')}`,
        recommendation: 'Consider adding redundancy for critical components'
      });
    }

    // Add security check for API Gateway
    if (!nodes.some(node => node.type === 'gateway')) {
      issues.push({
        type: 'SECURITY',
        description: 'Consider adding API Gateway for multiple services',
        recommendation: 'Review security architecture'
      });
    }

    return issues;
  }

  _checkSinglePointsOfFailure(nodes, edges) {
    // Return components that are critical and don't have redundancy
    return nodes
      .filter(node => node.type === 'cache' || node.type === 'database')
      .filter(node => {
        const similar = nodes.filter(n => n.type === node.type && n.id !== node.id);
        return similar.length === 0;
      })
      .map(node => `${node.type} (${node.label})`);
  }

  _calculateScore(patterns, complexity, criticalIssues) {
    // Basic scoring logic
    let score = 100;
    
    // Deduct points for critical issues
    score -= criticalIssues.length * 25;
    
    // Deduct points for high complexity
    if (complexity > 0.7) score -= 20;
    
    // Ensure score stays within 0-100 range
    return Math.max(0, Math.min(100, score));
  }
}

module.exports = DiagramAnalyzer;
