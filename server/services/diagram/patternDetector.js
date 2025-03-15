const { diagramStructure } = require('../../../data/diagram_structure');

class PatternDetector {
  constructor() {
    this.patterns = {
      loadBalancing: {
        detect: this._detectLoadBalancing,
        requirements: {
          nodes: ['loadBalancer', 'service'],
          minServices: 2
        }
      },
      microservices: {
        detect: this._detectMicroservices,
        requirements: {
          nodes: ['service'],
          minServices: 3,
          connections: true
        }
      },
      caching: {
        detect: this._detectCaching,
        requirements: {
          nodes: ['cache', 'service']
        }
      },
      messageQueue: {
        detect: this._detectMessageQueue,
        requirements: {
          nodes: ['queue', 'service']
        }
      },
      apiGateway: {
        detect: this._detectApiGateway,
        requirements: {
          nodes: ['gateway', 'service']
        }
      }
    };
  }

  detectPatterns(nodes, edges) {
    const results = {
      detectedPatterns: {},
      suggestions: [],
      score: 0
    };

    for (const [patternName, pattern] of Object.entries(this.patterns)) {
      const detection = this._analyzePattern(patternName, pattern, nodes, edges);
      results.detectedPatterns[patternName] = detection.detected;
      results.suggestions.push(...detection.suggestions);
      results.score += detection.score;
    }

    return results;
  }

  _analyzePattern(patternName, pattern, nodes, edges) {
    const result = pattern.detect(nodes, edges, pattern.requirements);
    return {
      detected: result.detected,
      suggestions: result.suggestions,
      score: result.detected ? 1 : 0
    };
  }

  _detectLoadBalancing(nodes, edges, requirements) {
    const loadBalancers = nodes.filter(n => n.type === 'loadBalancer');
    const services = nodes.filter(n => n.type === 'service');
    
    const hasValidConfig = loadBalancers.length > 0 && services.length >= requirements.minServices;
    const hasProperConnections = loadBalancers.every(lb => {
      const connectedServices = edges.filter(e => 
        (e.source === lb.id && services.some(s => s.id === e.target)) ||
        (e.target === lb.id && services.some(s => s.id === e.source))
      );
      return connectedServices.length >= 2;
    });

    return {
      detected: hasValidConfig && hasProperConnections,
      suggestions: !hasValidConfig ? 
        ['Add a load balancer to distribute traffic across multiple service instances'] :
        !hasProperConnections ?
        ['Connect load balancer to multiple service instances for proper load distribution'] : []
    };
  }

  _detectMicroservices(nodes, edges, requirements) {
    const services = nodes.filter(n => n.type === 'service');
    const hasEnoughServices = services.length >= requirements.minServices;
    
    const serviceConnections = new Map();
    edges.forEach(edge => {
      if (!serviceConnections.has(edge.source)) serviceConnections.set(edge.source, new Set());
      if (!serviceConnections.has(edge.target)) serviceConnections.set(edge.target, new Set());
      serviceConnections.get(edge.source).add(edge.target);
      serviceConnections.get(edge.target).add(edge.source);
    });

    const isLooselyCoupled = Array.from(serviceConnections.values())
      .every(connections => connections.size < services.length - 1);

    return {
      detected: hasEnoughServices && isLooselyCoupled,
      suggestions: !hasEnoughServices ?
        ['Consider breaking down the application into more microservices'] :
        !isLooselyCoupled ?
        ['Services appear tightly coupled. Consider reducing direct dependencies between services'] : []
    };
  }

  _detectCaching(nodes, edges, requirements) {
    const caches = nodes.filter(n => n.type === 'cache');
    const services = nodes.filter(n => n.type === 'service');
    
    const hasComponents = caches.length > 0 && services.length > 0;
    const hasProperConnections = caches.every(cache => 
      edges.some(e => 
        (e.source === cache.id && services.some(s => s.id === e.target)) ||
        (e.target === cache.id && services.some(s => s.id === e.source))
      )
    );

    return {
      detected: hasComponents && hasProperConnections,
      suggestions: !hasComponents ?
        ['Add caching layer to improve performance'] :
        !hasProperConnections ?
        ['Connect cache nodes to relevant services'] : []
    };
  }

  _detectMessageQueue(nodes, edges, requirements) {
    const queues = nodes.filter(n => n.type === 'queue');
    const services = nodes.filter(n => n.type === 'service');
    
    const hasComponents = queues.length > 0 && services.length > 0;
    const hasProducerConsumer = queues.every(queue => {
      const connectedServices = edges.filter(e => 
        e.source === queue.id || e.target === queue.id
      );
      return connectedServices.length >= 2;
    });

    return {
      detected: hasComponents && hasProducerConsumer,
      suggestions: !hasComponents ?
        ['Consider adding message queues for asynchronous communication'] :
        !hasProducerConsumer ?
        ['Ensure message queues have both producer and consumer services'] : []
    };
  }

  _detectApiGateway(nodes, edges, requirements) {
    const gateways = nodes.filter(n => n.type === 'gateway');
    const services = nodes.filter(n => n.type === 'service');
    
    const hasComponents = gateways.length > 0 && services.length > 0;
    const isProperlyConnected = gateways.every(gateway =>
      edges.some(e => e.source === gateway.id && services.some(s => s.id === e.target))
    );

    return {
      detected: hasComponents && isProperlyConnected,
      suggestions: !hasComponents ?
        ['Add an API Gateway to manage external requests'] :
        !isProperlyConnected ?
        ['Connect API Gateway to backend services'] : []
    };
  }
}

module.exports = PatternDetector;