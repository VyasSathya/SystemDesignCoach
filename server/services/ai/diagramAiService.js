const DiagramDataProcessor = require('../diagram/diagramDataProcessor');
const WorkbookDiagramService = require('../workbook/workbookDiagramService');

class DiagramAiService {
  constructor(aiService) {
    this.ai = aiService;
    this.processor = DiagramDataProcessor;
    this.workbookService = WorkbookDiagramService;
  }

  async analyzeDiagram(sessionId, diagramType) {
    const diagram = await this.workbookService.getDiagram(sessionId, diagramType);
    if (!diagram) throw new Error('Diagram not found');

    const mermaidCode = this.processor.reactFlowToMermaid(
      diagram.nodes, 
      diagram.edges, 
      diagramType
    );

    const analysis = await this.ai.analyzeDiagram({
      type: diagramType,
      mermaidCode,
      nodes: diagram.nodes,
      edges: diagram.edges
    });

    return {
      analysis,
      suggestions: analysis.suggestions,
      mermaidCode
    };
  }

  async getSuggestions(sessionId, diagramData, context) {
    const { nodes, edges, mermaidCode } = diagramData;
    
    const suggestions = await this.ai.generateSuggestions({
      mermaidCode,
      diagramState: { nodes, edges },
      context
    });

    return {
      suggestions,
      proposedMermaid: suggestions.diagramSuggestions?.mermaidCode,
      reactFlowUpdates: this.processor.mermaidToReactFlow(
        suggestions.diagramSuggestions?.mermaidCode,
        'system'
      )
    };
  }
}

module.exports = DiagramAiService;