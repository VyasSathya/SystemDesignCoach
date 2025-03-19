const { diagramStructure } = require('../../../data/diagram_structure');

class DiagramManager {
  constructor() {
    this.diagrams = new Map();
  }

  createDiagram(type, initialData) {
    const structure = diagramStructure[type];
    if (!structure) {
      throw new Error(`Unsupported diagram type: ${type}`);
    }

    const diagram = { 
      metadata: {
        type,
        title: initialData.title || 'Untitled Diagram',
        description: initialData.description || ''
      },
      components: this._initializeComponents(type, initialData),
      mermaid: {
        template: structure.mermaid.template,
        generated: this._generateMermaid(type, initialData)
      }
    };

    const diagramId = `${type}_${Date.now()}`;
    this.diagrams.set(diagramId, diagram);
    return { id: diagramId, ...diagram };
  }

  updateDiagram(diagramId, updates) {
    const diagram = this.diagrams.get(diagramId);
    if (!diagram) {
      throw new Error(`Diagram not found: ${diagramId}`);
    }

    const updatedComponents = this._mergeComponents(diagram.components, updates);
    const updatedDiagram = {
      ...diagram,
      components: updatedComponents,
      mermaid: {
        ...diagram.mermaid,
        generated: this._generateMermaid(diagram.metadata.type, updatedComponents)
      }
    };
    
    this.diagrams.set(diagramId, updatedDiagram);
    return updatedDiagram;
  }

  _initializeComponents(type, data) {
    switch (type) {
      case 'sequence':
        return {
          actors: data.actors || [],
          messages: data.messages || []
        };
      case 'system':
        return {
          nodes: data.nodes || [],
          connections: data.connections || []
        };
      default:
        return {};
    }
  }

  _generateMermaid(type, components) {
    const structure = diagramStructure[type];
    if (!structure?.mermaid?.template) {
      return '';
    }

    if (type === 'sequence') {
      const actorLines = components.actors
        .map(actor => `participant ${actor.id} as ${actor.name}`)
        .join('\n');
      const messageLines = components.messages
        .map(msg => `${msg.from}->>${msg.to}: ${msg.label}`)
        .join('\n');
      return `sequenceDiagram\n${actorLines}\n${messageLines}`;
    } 
    
    if (type === 'system') {
      const nodeLines = components.nodes
        .map(node => `${node.id}[${node.label}]`)
        .join('\n');
      const connectionLines = components.connections
        .map(conn => `${conn.from} -->|${conn.label}| ${conn.to}`)
        .join('\n');
      return `graph TD\n${nodeLines}\n${connectionLines}`;
    }

    return '';
  }

  _mergeComponents(existing, updates) {
    return {
      ...existing,
      ...Object.entries(updates).reduce((acc, [key, value]) => {
        if (Array.isArray(existing[key]) && Array.isArray(value)) {
          acc[key] = value.map(item => {
            if (item.id) {
              const existingItem = existing[key].find(e => e.id === item.id);
              return existingItem ? { ...existingItem, ...item } : item;
            }
            return item;
          });
        } else {
          acc[key] = value;
        }
        return acc;
      }, {})
    };
  }

  getDiagram(diagramId) {
    return this.diagrams.get(diagramId);
  }

  deleteDiagram(diagramId) {
    return this.diagrams.delete(diagramId);
  }
}

module.exports = DiagramManager;

