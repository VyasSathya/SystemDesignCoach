const { diagramStructure } = require('../../data/diagram_structure');

class DiagramDataProcessor {
  constructor() {
    this.structure = diagramStructure;
  }

  reactFlowToMermaid(nodes, edges, type) {
    switch(type) {
      case 'sequence':
        return this._processSequenceDiagram(nodes, edges);
      case 'system':
        return this._processSystemDiagram(nodes, edges);
      default:
        throw new Error(`Unsupported diagram type: ${type}`);
    }
  }

  _processSequenceDiagram(nodes, edges) {
    const actors = nodes.map(node => 
      `participant ${node.id} as "${node.data.label}"`
    );
    
    const messages = edges.map(edge => {
      const style = edge.data?.type === 'async' ? '-->>' : '->>';
      return `${edge.source}${style}${edge.target}: ${edge.data?.label || 'message'}`;
    });

    return `sequenceDiagram\n${actors.join('\n')}\n${messages.join('\n')}`;
  }

  _processSystemDiagram(nodes, edges) {
    const nodeLines = nodes.map(node => 
      `${node.id}[${node.data.label}]`
    );
    
    const edgeLines = edges.map(edge =>
      `${edge.source} --> ${edge.target}: ${edge.data?.label || ''}`
    );

    return `graph TD\n${nodeLines.join('\n')}\n${edgeLines.join('\n')}`;
  }

  mermaidToReactFlow(mermaidCode, type) {
    // Implementation for converting Mermaid to ReactFlow format
    // This would be used when receiving AI suggestions
  }

  validateDiagramData(nodes, edges, type) {
    const structure = this.structure[type];
    if (!structure) return false;
    
    // Implement validation logic based on diagram_structure.js
    return true;
  }
}

module.exports = new DiagramDataProcessor();