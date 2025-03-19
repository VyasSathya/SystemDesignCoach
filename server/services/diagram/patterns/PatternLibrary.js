class PatternLibrary {
  constructor() {
    this.patterns = {
      microservices: this._detectMicroservices,
      loadBalancing: this._detectLoadBalancing,
      caching: this._detectCaching,
      messageQueue: this._detectMessageQueue,
      apiGateway: this._detectApiGateway
    };
  }

  detectPatterns(diagram) {
    const detectedPatterns = {};
    
    for (const [patternName, detector] of Object.entries(this.patterns)) {
      detectedPatterns[patternName] = detector.call(this, diagram);
    }
    
    return detectedPatterns;
  }

  _detectMicroservices(diagram) {
    const services = diagram.nodes.filter(n => n.type === 'service');
    return {
      detected: services.length > 1,
      count: services.length,
      services: services.map(s => s.id)
    };
  }

  _detectLoadBalancing(diagram) {
    const loadBalancers = diagram.nodes.filter(n => n.type === 'loadBalancer');
    return {
      detected: loadBalancers.length > 0,
      count: loadBalancers.length,
      instances: loadBalancers.map(lb => lb.id)
    };
  }

  _detectCaching(diagram) {
    const caches = diagram.nodes.filter(n => n.type === 'cache');
    return {
      detected: caches.length > 0,
      count: caches.length,
      instances: caches.map(c => c.id)
    };
  }

  _detectMessageQueue(diagram) {
    const queues = diagram.nodes.filter(n => n.type === 'queue');
    return {
      detected: queues.length > 0,
      count: queues.length,
      instances: queues.map(q => q.id)
    };
  }

  _detectApiGateway(diagram) {
    const gateways = diagram.nodes.filter(n => n.type === 'gateway');
    return {
      detected: gateways.length > 0,
      count: gateways.length,
      instances: gateways.map(g => g.id)
    };
  }
}

module.exports = PatternLibrary;
