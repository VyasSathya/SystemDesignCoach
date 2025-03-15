import { Node, Edge } from 'reactflow';

export function mermaidToReactFlow(mermaidCode: string): { nodes: Node[], edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const lines = mermaidCode.split('\n');
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Skip empty lines and graph declaration
    if (!trimmedLine || trimmedLine === 'graph TD') return;
    
    // Parse node definitions and connections
    if (trimmedLine.includes('-->')) {
      // Edge definition
      const [source, target] = trimmedLine.split('-->').map(s => s.trim());
      edges.push({
        id: `edge-${index}`,
        source: source.replace(/[\[\]]/g, ''),
        target: target.replace(/[\[\]]/g, ''),
        type: 'smoothstep',
        animated: true
      });
    } else {
      // Node definition
      const match = trimmedLine.match(/(\w+)\[(.*?)\]/);
      if (match) {
        const [_, id, label] = match;
        nodes.push({
          id,
          type: 'infrastructureNode',
          data: { label },
          position: { x: Math.random() * 500, y: Math.random() * 500 }
        });
      }
    }
  });
  
  return { nodes, edges };
}

export function reactFlowToMermaid(nodes: Node[], edges: Edge[]): string {
  let mermaidCode = 'graph TD\n';
  
  // Add nodes
  nodes.forEach(node => {
    mermaidCode += `    ${node.id}[${node.data.label}]\n`;
  });
  
  // Add edges
  edges.forEach(edge => {
    mermaidCode += `    ${edge.source} --> ${edge.target}\n`;
  });
  
  return mermaidCode;
}