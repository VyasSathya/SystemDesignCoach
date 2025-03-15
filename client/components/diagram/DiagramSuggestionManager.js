import { useState, useCallback } from 'react';
import { getNodePositionForType } from './utils/nodePositioning';
import { templates } from '../../../server/services/diagram/templates';

export class DiagramSuggestionManager {
  constructor(nodes, edges, updateNodes, updateEdges) {
    this.nodes = nodes;
    this.edges = edges;
    this.updateNodes = updateNodes;
    this.updateEdges = updateEdges;
  }

  applySuggestion(suggestion) {
    switch (suggestion.type) {
      case 'component':
        return this.applyComponentSuggestion(suggestion);
      case 'pattern':
        return this.applyPatternSuggestion(suggestion);
      case 'scalability':
        return this.applyScalabilitySuggestion(suggestion);
      case 'security':
        return this.applySecuritySuggestion(suggestion);
      default:
        console.warn('Unknown suggestion type:', suggestion.type);
        return false;
    }
  }

  applyComponentSuggestion(suggestion) {
    const componentType = this.getComponentTypeFromSuggestion(suggestion);
    if (!componentType) return false;

    const position = this.calculateOptimalPosition(componentType);
    const newNode = {
      id: `${componentType}-${Date.now()}`,
      type: componentType,
      position,
      data: { label: suggestion.details.label || componentType }
    };

    this.updateNodes([...this.nodes, newNode]);
    return true;
  }

  applyPatternSuggestion(suggestion) {
    const patternTemplate = templates[suggestion.pattern];
    if (!patternTemplate) return false;

    // Get current diagram bounds
    const bounds = this.calculateDiagramBounds();
    
    // Offset pattern nodes based on current diagram
    const offsetNodes = patternTemplate.nodes.map(node => ({
      ...node,
      position: {
        x: node.position.x + bounds.maxX + 100,
        y: node.position.y
      }
    }));

    // Add new nodes and edges
    this.updateNodes([...this.nodes, ...offsetNodes]);
    this.updateEdges([...this.edges, ...patternTemplate.edges]);
    return true;
  }

  applyScalabilitySuggestion(suggestion) {
    switch (suggestion.component) {
      case 'loadBalancer':
        return this.addLoadBalancer();
      case 'cache':
        return this.addCache();
      case 'queue':
        return this.addQueue();
      default:
        return false;
    }
  }

  applySecuritySuggestion(suggestion) {
    switch (suggestion.component) {
      case 'apiGateway':
        return this.addApiGateway();
      case 'firewall':
        return this.addFirewall();
      default:
        return false;
    }
  }

  calculateOptimalPosition(componentType) {
    const bounds = this.calculateDiagramBounds();
    return getNodePositionForType(componentType, bounds, this.nodes);
  }

  calculateDiagramBounds() {
    const bounds = {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity
    };

    this.nodes.forEach(node => {
      bounds.minX = Math.min(bounds.minX, node.position.x);
      bounds.minY = Math.min(bounds.minY, node.position.y);
      bounds.maxX = Math.max(bounds.maxX, node.position.x);
      bounds.maxY = Math.max(bounds.maxY, node.position.y);
    });

    return bounds;
  }

  getComponentTypeFromSuggestion(suggestion) {
    const typeMap = {
      'Add load balancer': 'loadBalancer',
      'Add cache': 'cache',
      'Add queue': 'queue',
      'Add API Gateway': 'apiGateway',
      'Add database': 'database',
      'Add service': 'service',
      'Add client': 'client'
    };

    const matchedType = Object.entries(typeMap).find(([key]) => 
      suggestion.suggestion.includes(key)
    );

    return matchedType ? matchedType[1] : null;
  }
}