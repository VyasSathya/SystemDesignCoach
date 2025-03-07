export function mermaidToReactFlow(mermaidCode) {
  const nodes = [];
  const edges = [];
  try {
    const lines = mermaidCode.split('\n');
    let graphType = '';
    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('graph ') || line.startsWith('flowchart ')) {
        graphType = line.split(' ')[1];
        break;
      }
    }
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('graph ') || line.startsWith('flowchart ')) {
        continue;
      }
      if (line.includes('-->')) {
        const parts = line.split('-->');
        if (parts.length >= 2) {
          let sourceId = parts[0].trim();
          let targetId = parts[1].trim();
          let label = '';
          if (sourceId.includes('[') || sourceId.includes('(') || sourceId.includes('{')) {
            sourceId = sourceId.split(/[\[\(\{]/)[0].trim();
          }
          if (targetId.includes('|')) {
            const labelParts = targetId.split('|');
            label = labelParts[1];
            targetId = labelParts[0].trim();
          }
          if (targetId.includes('[') || targetId.includes('(') || targetId.includes('{')) {
            targetId = targetId.split(/[\[\(\{]/)[0].trim();
          }
          edges.push({
            id: `e-${sourceId}-${targetId}`,
            source: sourceId,
            target: targetId,
            label,
            type: 'smoothstep'
          });
        }
      } else if (line.includes('[') || line.includes('(') || line.includes('{')) {
        const nodeMatch = line.match(/([A-Za-z0-9_-]+)(\[.*?\]|\(.*?\)|\{.*?\}|\>\(.*?\)|\(\[.*?\])/);
        if (nodeMatch) {
          const id = nodeMatch[1].trim();
          const styleMarker = nodeMatch[2];
          let label = styleMarker.substring(1, styleMarker.length - 1);
          let type = 'service';
          if (styleMarker.startsWith('[(') && styleMarker.endsWith(')]')) {
            type = 'database';
          } else if (styleMarker.startsWith('>')) {
            type = 'client';
          } else if (styleMarker.startsWith('{') && styleMarker.endsWith('}')) {
            type = 'loadBalancer';
          } else if (styleMarker.startsWith('((') && styleMarker.endsWith('))')) {
            type = 'cache';
          } else if (styleMarker.startsWith('([') && styleMarker.endsWith('])')) {
            type = 'queue';
          }
          nodes.push({
            id,
            type,
            position: { x: 150 * (nodes.length % 4), y: 120 * Math.floor(nodes.length / 4) },
            data: { label }
          });
        }
      }
    }
    return { nodes, edges };
  } catch (error) {
    console.error('Error parsing Mermaid code:', error);
    throw new Error('Failed to convert Mermaid to React Flow: ' + error.message);
  }
}

export function reactFlowToMermaid(reactFlowData) {
  const { nodes, edges } = reactFlowData;
  try {
    let mermaidCode = 'graph TD\n';
    nodes.forEach((node) => {
      let nodeStyle = '[';
      let closeStyle = ']';
      switch (node.type) {
        case 'database':
          nodeStyle = '[(';
          closeStyle = ')]';
          break;
        case 'client':
          nodeStyle = '>';
          closeStyle = ')';
          break;
        case 'loadBalancer':
          nodeStyle = '{';
          closeStyle = '}';
          break;
        case 'cache':
          nodeStyle = '((';
          closeStyle = '))';
          break;
        case 'queue':
          nodeStyle = '([';
          closeStyle = '])';
          break;
        default:
          nodeStyle = '[';
          closeStyle = ']';
      }
      mermaidCode += `    ${node.id}${nodeStyle}${node.data.label}${closeStyle}\n`;
    });
    edges.forEach((edge) => {
      const labelText = edge.label ? `|${edge.label}|` : '';
      mermaidCode += `    ${edge.source} -->${labelText} ${edge.target}\n`;
    });
    return mermaidCode;
  } catch (error) {
    console.error('Error converting React Flow to Mermaid:', error);
    throw new Error('Failed to convert React Flow to Mermaid: ' + error.message);
  }
}
