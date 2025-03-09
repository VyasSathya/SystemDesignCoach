// client/components/diagram/utils/conversion.js
import { MarkerType } from 'reactflow';

// Node shape mappings from Mermaid syntax to node types
const MERMAID_NODE_TYPES = {
  '(': 'cache',           // Circle = Cache
  '[': 'service',         // Rectangle = Service
  '[[': 'service',        // Rectangle = Service variant
  '{': 'loadBalancer',    // Diamond = Load Balancer
  '((': 'database',       // Database
  '>': 'client',          // Flag shape = Client
  '([': 'queue'           // Stadium shape = Queue
};

// Extract node type from Mermaid syntax
const getNodeType = (mermaidNodeDef) => {
  // Check for standard brackets that define node shapes in Mermaid
  for (const [bracket, type] of Object.entries(MERMAID_NODE_TYPES)) {
    if (mermaidNodeDef.includes(`${bracket}`)) {
      return type;
    }
  }
  
  // Check for explicit node type if present in the node id (e.g., database_1234 = database)
  const lowerNodeDef = mermaidNodeDef.toLowerCase();
  if (lowerNodeDef.includes('database')) return 'database';
  if (lowerNodeDef.includes('client')) return 'client';
  if (lowerNodeDef.includes('service')) return 'service';
  if (lowerNodeDef.includes('cache')) return 'cache';
  if (lowerNodeDef.includes('queue')) return 'queue';
  if (lowerNodeDef.includes('loadbalancer') || lowerNodeDef.includes('load_balancer')) return 'loadBalancer';
  
  // Default to service if no type is detected
  return 'service';
};

// Extract node label from Mermaid node definition
const getNodeLabel = (nodeText) => {
  // Check for bracket notation with label: Node["Label"]
  const bracketLabelMatch = nodeText.match(/\["([^"]+)"\]/);
  if (bracketLabelMatch) {
    return bracketLabelMatch[1];
  }
  
  // Check for parenthesis notation with label: Node("Label")
  const parenLabelMatch = nodeText.match(/\("([^"]+)"\)/);
  if (parenLabelMatch) {
    return parenLabelMatch[1];
  }
  
  // Check for standard label: Node[Label]
  const standardLabelMatch = nodeText.match(/\[([^\]]+)\]/);
  if (standardLabelMatch) {
    return standardLabelMatch[1];
  }
  
  // Check for database label: Node[(Label)]
  const dbLabelMatch = nodeText.match(/\[\(([^)]+)\)\]/);
  if (dbLabelMatch) {
    return dbLabelMatch[1];
  }
  
  // Check for cache label: Node((Label))
  const cacheLabelMatch = nodeText.match(/\(\(([^)]+)\)\)/);
  if (cacheLabelMatch) {
    return cacheLabelMatch[1];
  }
  
  // Check for client label: Node>Label]
  const clientLabelMatch = nodeText.match(/>([^]]+)\]/);
  if (clientLabelMatch) {
    return clientLabelMatch[1];
  }
  
  // Check for queue label: Node([Label])
  const queueLabelMatch = nodeText.match(/\(\[([^\]]+)\]\)/);
  if (queueLabelMatch) {
    return queueLabelMatch[1];
  }
  
  // If no specific label format is found, use the node ID as label
  return nodeText;
};

// Convert Mermaid diagram code to ReactFlow nodes and edges
export const mermaidToReactFlow = (mermaidCode) => {
  if (!mermaidCode) {
    return { nodes: [], edges: [] };
  }
  
  const nodes = [];
  const edges = [];
  const nodeMap = {};
  
  try {
    // Split the Mermaid code into lines
    const lines = mermaidCode.split('\n');
    
    // Process each line
    lines.forEach((line, lineIndex) => {
      // Skip empty lines, comments, and the graph definition line
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('%') || trimmedLine.startsWith('graph ')) {
        return;
      }
      
      // Check if the line defines a node
      if (!trimmedLine.includes('-->') && !trimmedLine.includes('---') && !trimmedLine.includes('~~~')) {
        const nodeParts = trimmedLine.split('=');
        const nodeId = nodeParts[0].trim();
        const nodeDef = nodeParts.length > 1 ? nodeParts[1].trim() : nodeId;
        
        // Skip if this is not a node definition
        if (!nodeId || nodeId.includes(' ')) {
          return;
        }
        
        const type = getNodeType(nodeDef);
        
        // Extract the label from the node definition
        let label = getNodeLabel(nodeDef);
        
        // If label was not found using the special formats, try to extract from the Mermaid syntax
        if (label === nodeId && nodeDef !== nodeId) {
          // Extract text between brackets, parentheses or other syntax markers
          const simpleMatch = nodeDef.match(/\[(.*?)\]|\((.*?)\)|{(.*?)}|>(.*?)]/);
          if (simpleMatch) {
            label = simpleMatch.find(match => match && match !== nodeDef) || nodeId;
          }
        }
        
        // Create the ReactFlow node
        const node = {
          id: nodeId,
          type: type,
          position: { 
            x: 150 + (lineIndex * 50), 
            y: 100 + (lineIndex * 50) 
          },
          data: { 
            label: label || nodeId,
            notes: ''
          }
        };
        
        nodes.push(node);
        nodeMap[nodeId] = node;
      }
      // Check if the line defines an edge
      else if (trimmedLine.includes('-->') || trimmedLine.includes('---')) {
        const isDirected = trimmedLine.includes('-->');
        const edgeParts = isDirected 
          ? trimmedLine.split('-->') 
          : trimmedLine.split('---');
        
        if (edgeParts.length >= 2) {
          const sourceId = edgeParts[0].trim();
          const targetId = edgeParts[1].trim();
          
          // Extract label if present
          let label = '';
          const labelMatch = targetId.match(/\|([^|]+)\|/);
          if (labelMatch) {
            label = labelMatch[1].trim();
          }
          
          // Clean up target ID if it contains a label
          const cleanTargetId = targetId.split('|')[0].trim();
          
          // Create the ReactFlow edge
          const edge = {
            id: `edge-${sourceId}-${cleanTargetId}`,
            source: sourceId,
            target: cleanTargetId,
            label: label,
            type: 'smoothstep',
            markerEnd: isDirected ? { type: MarkerType.ArrowClosed } : undefined
          };
          
          edges.push(edge);
        }
      }
    });
    
    // If nodes have position data from a previous ReactFlow state, use it
    // Otherwise, arrange nodes in a simple grid
    if (nodes.length > 0 && !nodes[0].position) {
      const gridSize = Math.ceil(Math.sqrt(nodes.length));
      nodes.forEach((node, index) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        node.position = {
          x: 150 + (col * 200),
          y: 100 + (row * 150)
        };
      });
    }
    
    return { nodes, edges };
  } catch (error) {
    console.error('Error converting Mermaid to ReactFlow:', error);
    throw new Error(`Failed to convert Mermaid to ReactFlow: ${error.message}`);
  }
};

// Convert ReactFlow nodes and edges to Mermaid diagram code
export const reactFlowToMermaid = ({ nodes, edges }) => {
  if (!nodes || !edges) {
    return 'graph TD\n    A[Empty Diagram]';
  }
  
  try {
    let mermaidCode = 'graph TD\n';
    
    // Define node shapes based on type
    const nodeShapes = {
      database: '[(Database)]',
      service: '[Service]',
      client: '>Client]',
      cache: '((Cache))',
      loadBalancer: '{Load Balancer}',
      queue: '([Queue])',
      custom: '[Custom]'
    };
    
    // Add nodes
    nodes.forEach(node => {
      const label = node.data.label || node.id;
      const type = node.type || 'service';
      
      // Get the base shape for this node type
      let shape = nodeShapes[type] || '[Node]';
      
      // Replace the default label with the custom label (but keep the brackets/shape)
      const openBracket = shape.indexOf('[');
      const closeBracket = shape.lastIndexOf(']');
      
      if (openBracket >= 0 && closeBracket > openBracket) {
        shape = shape.substring(0, openBracket + 1) + label + shape.substring(closeBracket);
      } else {
        // For shapes that don't use square brackets
        const openParen = shape.indexOf('(');
        const closeParen = shape.lastIndexOf(')');
        
        if (openParen >= 0 && closeParen > openParen) {
          shape = shape.substring(0, openParen + 1) + label + shape.substring(closeParen);
        } else {
          // For other shapes like diamond
          const openBrace = shape.indexOf('{');
          const closeBrace = shape.lastIndexOf('}');
          
          if (openBrace >= 0 && closeBrace > openBrace) {
            shape = shape.substring(0, openBrace + 1) + label + shape.substring(closeBrace);
          } else {
            // Fallback: just add label in square brackets
            shape = `[${label}]`;
          }
        }
      }
      
      mermaidCode += `    ${node.id}${shape}\n`;
    });
    
    // Add edges
    edges.forEach(edge => {
      const arrow = '-->'; // Use directed arrows
      
      if (edge.label) {
        mermaidCode += `    ${edge.source} ${arrow} |${edge.label}| ${edge.target}\n`;
      } else {
        mermaidCode += `    ${edge.source} ${arrow} ${edge.target}\n`;
      }
    });
    
    return mermaidCode;
  } catch (error) {
    console.error('Error converting ReactFlow to Mermaid:', error);
    throw new Error(`Failed to convert ReactFlow to Mermaid: ${error.message}`);
  }
};