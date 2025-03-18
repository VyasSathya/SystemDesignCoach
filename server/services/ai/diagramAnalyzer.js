const logger = require('../../utils/logger');

class DiagramAnalyzer {
  constructor() {
    this.patterns = new Set(['loadbalancer', 'cache', 'database', 'api', 'microservice']);
  }

  analyzeDiagram(nodes, edges, type = 'system') {
    try {
      return {
        components: this._analyzeComponents(nodes),
        connections: this._analyzeConnections(edges),
        patterns: this._detectPatterns(nodes, edges),
        metrics: this._calculateMetrics(nodes, edges)
      };
    } catch (error) {
      logger.error('Error analyzing diagram:', error);
      throw new Error('Failed to analyze diagram');
    }
  }

  _analyzeComponents(nodes) {
    return nodes.map(node => ({
      id: node.id,
      type: node.type,
      name: node.data?.label || 'Unnamed Component',
      properties: node.data?.properties || {}
    }));
  }

  _analyzeConnections(edges) {
    return edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      type: edge.type || 'default'
    }));
  }

  _detectPatterns(nodes, edges) {
    const patterns = [];
    const nodeTypes = new Set(nodes.map(n => n.type));

    if (this._hasLoadBalancing(nodes, edges)) {
      patterns.push('load_balancing');
    }
    if (this._hasCaching(nodes)) {
      patterns.push('caching');
    }
    if (this._hasMicroservices(nodes, edges)) {
      patterns.push('microservices');
    }

    return patterns;
  }

  _calculateMetrics(nodes, edges) {
    return {
      complexity: this._calculateComplexity(nodes, edges),
      connectivity: this._calculateConnectivity(nodes, edges),
      modularity: this._calculateModularity(nodes, edges)
    };
  }

  _hasLoadBalancing(nodes, edges) {
    return nodes.some(node => 
      node.type?.toLowerCase().includes('loadbalancer') ||
      node.data?.label?.toLowerCase().includes('load balancer')
    );
  }

  _hasCaching(nodes) {
    return nodes.some(node => 
      node.type?.toLowerCase().includes('cache') ||
      node.data?.label?.toLowerCase().includes('cache')
    );
  }

  _hasMicroservices(nodes, edges) {
    const serviceCount = nodes.filter(node => 
      node.type?.toLowerCase().includes('service') ||
      node.data?.label?.toLowerCase().includes('service')
    ).length;
    return serviceCount > 1;
  }

  _calculateComplexity(nodes, edges) {
    return (nodes.length * 0.6) + (edges.length * 0.4);
  }

  _calculateConnectivity(nodes, edges) {
    return edges.length / (nodes.length || 1);
  }

  _calculateModularity(nodes, edges) {
    // Simple modularity score based on component grouping
    const groups = new Set(nodes.map(n => n.data?.group));
    return groups.size / (nodes.length || 1);
  }
}

module.exports = DiagramAnalyzer;