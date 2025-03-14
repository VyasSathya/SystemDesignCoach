const AIFactory = require('../ai/aiFactory');
const aiConfig = require('../../config/aiConfig');
const logger = require('../../utils/logger');

class DiagramAnalyzer {
  constructor() {
    this.aiService = AIFactory.createService(
      aiConfig.defaultProvider, 
      aiConfig[aiConfig.defaultProvider]
    );
  }

  async analyzeDiagram(nodes, edges, type) {
    try {
      const analysis = {
        security: this._analyzeSecurityConcerns(nodes, edges),
        scalability: this._analyzeScalability(nodes),
        reliability: this._analyzeReliability(nodes, edges),
        suggestions: await this._generateSuggestions(nodes, edges, type)
      };

      return analysis;
    } catch (error) {
      logger.error('Error analyzing diagram:', error);
      throw new Error('Failed to analyze diagram');
    }
  }

  _analyzeSecurityConcerns(nodes, edges) {
    const concerns = [];
    
    // Check for exposed databases
    const databases = nodes.filter(n => n.type === 'database');
    const directDbConnections = edges.filter(e => 
      databases.some(db => db.id === e.target) &&
      nodes.find(n => n.id === e.source)?.type === 'client'
    );

    if (directDbConnections.length > 0) {
      concerns.push({
        level: 'high',
        message: 'Direct client-to-database connections detected. Consider adding an API layer.',
        affected: directDbConnections.map(e => e.id)
      });
    }

    // Check for missing authentication services
    const hasAuthService = nodes.some(n => 
      n.type === 'service' && 
      n.data.label.toLowerCase().includes('auth')
    );

    if (!hasAuthService) {
      concerns.push({
        level: 'medium',
        message: 'No authentication service detected. Consider adding user authentication.',
        affected: []
      });
    }

    return concerns;
  }

  _analyzeScalability(nodes) {
    const recommendations = [];

    // Check for load balancers
    const hasLoadBalancer = nodes.some(n => n.type === 'loadBalancer');
    if (!hasLoadBalancer && nodes.filter(n => n.type === 'service').length > 1) {
      recommendations.push({
        priority: 'high',
        message: 'Multiple services detected without load balancer. Consider adding load balancing for better scalability.'
      });
    }

    // Check for caching
    const hasCache = nodes.some(n => n.type === 'cache');
    if (!hasCache) {
      recommendations.push({
        priority: 'medium',
        message: 'No caching layer detected. Consider adding caching to improve performance.'
      });
    }

    return recommendations;
  }

  _analyzeReliability(nodes, edges) {
    const issues = [];

    // Check for single points of failure
    const services = nodes.filter(n => n.type === 'service');
    services.forEach(service => {
      const connections = edges.filter(e => 
        e.source === service.id || e.target === service.id
      );

      if (connections.length > 3) {
        issues.push({
          severity: 'medium',
          message: `Service "${service.data.label}" has many dependencies. Consider breaking it down.`,
          nodeId: service.id
        });
      }
    });

    return issues;
  }

  async _generateSuggestions(nodes, edges, type) {
    const systemPrompt = `You are a system design expert. Analyze this system design diagram and provide specific, actionable improvements.
    Focus on architectural patterns, best practices, and potential optimizations.
    Provide 3-5 concrete suggestions.`;

    const diagramDescription = nodes.map(n => 
      `${n.data.label} (${n.type})`
    ).join(', ');

    const response = await this.aiService.sendMessage([
      { 
        role: "user", 
        content: `Analyzing diagram of type: ${type}\nComponents: ${diagramDescription}`
      }
    ], {
      systemPrompt,
      temperature: 0.7
    });

    return response.split('\n').filter(line => line.trim());
  }
}

module.exports = new DiagramAnalyzer();