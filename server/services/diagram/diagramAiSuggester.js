const AIFactory = require('../ai/aiFactory');
const { diagramStructure } = require('../../../data/diagram_structure');
const DiagramAnalyzer = require('./diagramAnalyzer');

class DiagramAiSuggester {
  constructor() {
    this.analyzer = new DiagramAnalyzer();
    this.ai = AIFactory.createService('claude', {
      temperature: 0.3,
      maxTokens: 2000
    });
  }

  async generateSuggestions(diagram, context) {
    const analysis = this.analyzer.analyzeDiagram(diagram.nodes, diagram.edges, diagram.type);
    const patterns = this._identifyMissingPatterns(diagram);
    
    const prompt = this._buildPrompt(diagram, analysis, patterns, context);
    const suggestions = await this.ai.generateSuggestions(prompt);

    return {
      immediateActions: this._generateImmediateActions(analysis, patterns),
      aiSuggestions: suggestions,
      proposedChanges: this._generateProposedChanges(diagram, patterns)
    };
  }

  _identifyMissingPatterns(diagram) {
    const missingPatterns = {
      loadBalancing: !diagram.nodes.some(n => n.type === 'loadBalancer'),
      caching: !diagram.nodes.some(n => n.type === 'cache'),
      messageQueue: !diagram.nodes.some(n => n.type === 'queue'),
      apiGateway: !diagram.nodes.some(n => n.type === 'apiGateway'),
      serviceDiscovery: !diagram.nodes.some(n => n.type === 'serviceDiscovery'),
      cdn: !diagram.nodes.some(n => n.type === 'cdn')
    };

    return Object.entries(missingPatterns)
      .filter(([_, isMissing]) => isMissing)
      .map(([pattern]) => pattern);
  }

  _buildPrompt(diagram, analysis, patterns, context) {
    return {
      type: diagram.type,
      components: {
        current: diagram.nodes.map(n => ({
          type: n.type,
          connections: diagram.edges
            .filter(e => e.source === n.id || e.target === n.id)
            .map(e => ({
              type: e.type,
              with: e.source === n.id ? e.target : e.source
            }))
        })),
        missing: patterns
      },
      analysis: {
        criticalIssues: analysis.criticalIssues,
        suggestions: analysis.suggestions
      },
      context: {
        stage: context.stage,
        problemDomain: context.problemDomain,
        requirements: context.requirements
      }
    };
  }

  _generateImmediateActions(analysis, patterns) {
    const actions = [];

    // Add critical security fixes
    if (analysis.criticalIssues.some(issue => issue.category === 'security')) {
      actions.push({
        type: 'security',
        priority: 'high',
        action: 'Add API Gateway for authentication and authorization',
        nodeType: 'apiGateway'
      });
    }

    // Add scalability improvements
    if (patterns.includes('loadBalancing')) {
      actions.push({
        type: 'scalability',
        priority: 'high',
        action: 'Add load balancer to distribute traffic',
        nodeType: 'loadBalancer'
      });
    }

    // Add performance optimizations
    if (patterns.includes('caching')) {
      actions.push({
        type: 'performance',
        priority: 'medium',
        action: 'Add caching layer to improve response times',
        nodeType: 'cache'
      });
    }

    return actions;
  }

  _generateProposedChanges(diagram, patterns) {
    const changes = [];
    const centerX = this._calculateCenterX(diagram.nodes);
    const centerY = this._calculateCenterY(diagram.nodes);

    patterns.forEach(pattern => {
      switch (pattern) {
        case 'loadBalancing':
          changes.push({
            type: 'add_node',
            nodeType: 'loadBalancer',
            position: { x: centerX - 200, y: centerY - 100 },
            connections: this._findServiceNodes(diagram.nodes)
          });
          break;

        case 'caching':
          changes.push({
            type: 'add_node',
            nodeType: 'cache',
            position: { x: centerX + 200, y: centerY },
            connections: this._findDatabaseNodes(diagram.nodes)
          });
          break;

        case 'messageQueue':
          changes.push({
            type: 'add_node',
            nodeType: 'queue',
            position: { x: centerX, y: centerY + 150 },
            connections: this._findServiceNodes(diagram.nodes)
          });
          break;
      }
    });

    return changes;
  }

  _calculateCenterX(nodes) {
    const xs = nodes.map(n => n.position.x);
    return (Math.min(...xs) + Math.max(...xs)) / 2;
  }

  _calculateCenterY(nodes) {
    const ys = nodes.map(n => n.position.y);
    return (Math.min(...ys) + Math.max(...ys)) / 2;
  }

  _findServiceNodes(nodes) {
    return nodes
      .filter(n => n.type === 'service')
      .map(n => n.id);
  }

  _findDatabaseNodes(nodes) {
    return nodes
      .filter(n => n.type === 'database')
      .map(n => n.id);
  }
}

module.exports = DiagramAiSuggester;
