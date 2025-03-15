const PatternLibrary = require('./patterns/PatternLibrary');
const { calculateComplexity } = require('./utils/complexityCalculator');

class DiagramAnalyzer {
  constructor() {
    this.patternLibrary = new PatternLibrary();
  }

  analyzeDiagram(nodes, edges, type) {
    // Ensure nodes and edges are arrays
    const nodeArray = Array.isArray(nodes) ? nodes : Object.values(nodes);
    const edgeArray = Array.isArray(edges) ? edges : Object.values(edges);

    // Detect and analyze patterns
    const patterns = this.patternLibrary.detectPatterns(nodeArray, edgeArray);
    const patternSuggestions = this.patternLibrary.getPatternSuggestions(nodeArray, edgeArray);

    // Calculate complexity metrics
    const complexity = calculateComplexity(nodeArray, edgeArray);

    // Analyze for critical issues
    const criticalIssues = this._analyzeCriticalIssues(nodeArray, edgeArray, type);

    // Generate overall score
    const score = this._calculateScore(patterns, complexity, criticalIssues);

    return {
      patterns,
      suggestions: patternSuggestions,
      complexity,
      criticalIssues,
      score
    };
  }

  _analyzeCriticalIssues(nodes, edges, type) {
    const issues = [];

    // Check for single points of failure
    const spofComponents = this._checkSinglePointsOfFailure(nodes, edges);
    if (spofComponents.length > 0) {
      issues.push(`Single points of failure detected: ${spofComponents.join(', ')}`);
    }

    // Check for security concerns
    const securityIssues = this._checkSecurityConcerns(nodes, type);
    issues.push(...securityIssues);

    // Check for scalability issues
    const scalabilityIssues = this._checkScalabilityIssues(nodes, edges);
    issues.push(...scalabilityIssues);

    return issues;
  }

  _checkSinglePointsOfFailure(nodes, edges) {
    const spofComponents = [];
    const criticalTypes = ['database', 'cache', 'loadBalancer', 'apiGateway'];

    nodes.forEach(node => {
      if (criticalTypes.includes(node.type)) {
        const redundantNodes = nodes.filter(n => 
          n.type === node.type && n.id !== node.id
        );
        if (redundantNodes.length === 0) {
          spofComponents.push(`${node.type} (${node.label || node.id})`);
        }
      }
    });

    return spofComponents;
  }

  _checkSecurityConcerns(nodes, type) {
    const issues = [];
    const hasLoadBalancer = nodes.some(n => n.type === 'loadBalancer');
    const hasApiGateway = nodes.some(n => n.type === 'apiGateway');
    const hasFirewall = nodes.some(n => n.type === 'firewall');

    if (type === 'public' && !hasLoadBalancer) {
      issues.push('Missing load balancer for public-facing services');
    }
    if (!hasApiGateway && nodes.filter(n => n.type === 'service').length > 2) {
      issues.push('Consider adding API Gateway for multiple services');
    }
    if (type === 'public' && !hasFirewall) {
      issues.push('Missing firewall protection');
    }

    return issues;
  }

  _checkScalabilityIssues(nodes, edges) {
    const issues = [];
    const services = nodes.filter(n => n.type === 'service');
    const databases = nodes.filter(n => n.type === 'database');
    const caches = nodes.filter(n => n.type === 'cache');

    if (services.length > 3 && !nodes.some(n => n.type === 'loadBalancer')) {
      issues.push('Multiple services without load balancing');
    }
    if (databases.length > 0 && caches.length === 0) {
      issues.push('Database without caching layer');
    }

    return issues;
  }

  _calculateScore(patterns, complexity, criticalIssues) {
    let score = 100;

    // Deduct for missing essential patterns
    const essentialPatterns = ['LoadBalancing', 'Caching', 'Security'];
    const missingEssential = essentialPatterns.filter(
      ep => !patterns.some(p => p.name === ep)
    );
    score -= missingEssential.length * 10;

    // Deduct for complexity issues
    if (complexity.score < 0.5) score -= 20;
    if (complexity.score < 0.3) score -= 20;

    // Deduct for critical issues
    score -= criticalIssues.length * 15;

    return Math.max(0, Math.min(100, score));
  }
}

module.exports = DiagramAnalyzer;
