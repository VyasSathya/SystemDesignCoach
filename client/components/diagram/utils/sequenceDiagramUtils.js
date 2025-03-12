// client/components/diagram/utils/sequenceDiagramUtils.js

/**
 * Convert a ReactFlow sequence diagram to Mermaid syntax
 * 
 * @param {Array} nodes - ReactFlow nodes
 * @param {Array} edges - ReactFlow edges
 * @returns {string} - Mermaid code for the sequence diagram
 */
export function generateMermaidCode(nodes, edges) {
    if (!nodes || !edges) return '';
    
    const participants = nodes.filter(node => 
      node.type === 'actor' || node.type === 'participant'
    );
    
    // Start with sequence diagram declaration
    let code = 'sequenceDiagram\n';
    
    // Get all fragments for processing
    const fragments = nodes.filter(node => node.type === 'fragment');
    
    // Get all notes for processing
    const notes = nodes.filter(node => node.type === 'note');
    
    // Declare participants
    participants.forEach(participant => {
      if (participant.type === 'actor') {
        code += `    actor ${participant.data.label.replace(/\s+/g, '_')}\n`;
      } else {
        code += `    participant ${participant.data.label.replace(/\s+/g, '_')}\n`;
      }
    });
    
    // Sort edges by vertical position to maintain proper sequence
    const sortedEdges = [...edges].sort((a, b) => {
      const nodeA = nodes.find(n => n.id === a.source);
      const nodeB = nodes.find(n => n.id === b.source);
      if (!nodeA || !nodeB) return 0;
      
      return nodeA.position.y - nodeB.position.y;
    });
    
    // Process the notes
    notes.forEach(note => {
      // Find the closest participant (simplified approach)
      const closestParticipant = findClosestParticipant(note, participants);
      if (closestParticipant) {
        const participantLabel = closestParticipant.data.label.replace(/\s+/g, '_');
        code += `    Note over ${participantLabel}: ${note.data.label}\n`;
      }
    });
    
    // Add fragments (handle proper nesting in mermaid)
    // Sort fragments by nesting level (outermost first)
    const sortedFragments = [...fragments].sort((a, b) => 
      (a.data.nestingLevel || 0) - (b.data.nestingLevel || 0)
    );
    
    sortedFragments.forEach(fragment => {
      // Find affected participants
      const affectedParticipants = findParticipantsInFragment(fragment, participants);
      if (affectedParticipants.length >= 1) {
        const first = affectedParticipants[0].data.label.replace(/\s+/g, '_');
        const last = affectedParticipants[affectedParticipants.length - 1]?.data.label.replace(/\s+/g, '_') || first;
        
        // Get fragment type and condition
        const fragmentType = fragment.data.fragmentType || 'opt';
        const condition = fragment.data.condition || '';
        
        // Add the fragment start
        if (fragmentType === 'ref') {
          // References are handled differently in Mermaid
          code += `    ref over ${first},${last}: ${fragment.data.label || 'Reference'}\n`;
        } else {
          code += `    ${fragmentType} ${condition}\n`;
          
          // If we have a label for the fragment, add it as a note
          if (fragment.data.label) {
            code += `    Note over ${first},${last}: ${fragment.data.label}\n`;
          }
          
          // Add any internal messages that belong to this fragment
          // This is a simplified approach - a full implementation would track
          // which messages are inside which fragments
          
          // End the fragment
          code += `    end\n`;
        }
      }
    });
    
    // Add messages
    sortedEdges.forEach(edge => {
      if (!edge.data?.label) return;
      
      // Find the source node
      const sourceNode = nodes.find(n => n.id === edge.source);
      // Find the target node
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return;
      
      // Handle different node types
      let sourceLabel, targetLabel;
      
      // Get source label based on node type
      if (sourceNode.type === 'lifeline') {
        // For lifelines, find the parent participant
        const sourceParticipant = nodes.find(n => 
          (n.type === 'actor' || n.type === 'participant') && 
          sourceNode.data?.participantId === n.id
        );
        
        if (sourceParticipant) {
          sourceLabel = sourceParticipant.data.label.replace(/\s+/g, '_');
        } else {
          sourceLabel = 'Unknown';
        }
      } else if (sourceNode.type === 'gate') {
        sourceLabel = '['; // Mermaid syntax for external entities
      } else {
        // For other node types, use their own label
        sourceLabel = sourceNode.data?.label.replace(/\s+/g, '_') || 'Unknown';
      }
      
      // Get target label based on node type
      if (targetNode.type === 'lifeline') {
        // For lifelines, find the parent participant
        const targetParticipant = nodes.find(n => 
          (n.type === 'actor' || n.type === 'participant') && 
          targetNode.data?.participantId === n.id
        );
        
        if (targetParticipant) {
          targetLabel = targetParticipant.data.label.replace(/\s+/g, '_');
        } else {
          targetLabel = 'Unknown';
        }
      } else if (targetNode.type === 'gate') {
        targetLabel = ']'; // Mermaid syntax for external entities
      } else {
        // For other node types, use their own label
        targetLabel = targetNode.data?.label.replace(/\s+/g, '_') || 'Unknown';
      }
      
      const messageLabel = edge.data.label;
      const messageType = edge.data.type || 'sync';
      
      // Map ReactFlow's message types to Mermaid syntax
      switch (messageType) {
        case 'create':
          code += `    ${sourceLabel}->>+${targetLabel}: ${messageLabel}\n`;
          break;
        case 'destroy':
          code += `    ${sourceLabel}-x${targetLabel}: ${messageLabel}\n`;
          break;
        case 'async':
          code += `    ${sourceLabel}-->>+${targetLabel}: ${messageLabel}\n`;
          break;
        case 'return':
        case 'reply':
          code += `    ${sourceLabel}-->>-${targetLabel}: ${messageLabel}\n`;
          break;
        case 'found':
          // For 'found' messages, use a placeholder syntax
          code += `    [->+${targetLabel}: ${messageLabel}\n`;
          break;
        case 'lost':
          // For 'lost' messages, use a placeholder syntax
          code += `    ${sourceLabel}->]: ${messageLabel}\n`;
          break;
        default: // sync
          code += `    ${sourceLabel}->>+${targetLabel}: ${messageLabel}\n`;
      }
    });
    
    return code;
  }
  
  /**
   * Convert Mermaid sequence diagram code to ReactFlow nodes and edges
   * 
   * @param {string} mermaidCode - Mermaid sequence diagram code
   * @returns {Object} - { nodes, edges } for ReactFlow
   */
  export function mermaidToReactFlow(mermaidCode) {
    if (!mermaidCode) return { nodes: [], edges: [] };
    
    const lines = mermaidCode.split('\n');
    const nodes = [];
    const edges = [];
    
    // Map to keep track of participants and their positions
    const participantMap = {};
    
    // Parse participant declarations
    let horizontalPosition = 100;
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Skip empty lines and the initial sequenceDiagram declaration
      if (!trimmedLine || trimmedLine === 'sequenceDiagram') return;
      
      // Parse actor declarations
      const actorMatch = trimmedLine.match(/^\s*actor\s+([^\s:]+)/);
      if (actorMatch) {
        const participantId = `actor-${Date.now()}-${Object.keys(participantMap).length}`;
        const lifelineId = `lifeline-${Date.now()}-${Object.keys(participantMap).length}`;
        
        // Clean up the participant name
        const participantName = actorMatch[1].replace(/_/g, ' ');
        
        // Create actor node
        nodes.push({
          id: participantId,
          type: 'actor',
          position: { x: horizontalPosition, y: 50 },
          data: { 
            label: participantName,
            id: participantId
          }
        });
        
        // Create lifeline node
        nodes.push({
          id: lifelineId,
          type: 'lifeline',
          position: { x: horizontalPosition + 25, y: 120 },
          data: { 
            label: '', 
            participantId: participantId,
            height: 400,
            activations: [],
            id: lifelineId
          }
        });
        
        // Track participant for message connections
        participantMap[actorMatch[1]] = {
          id: participantId,
          lifelineId: lifelineId,
          position: horizontalPosition
        };
        
        // Increment position for next participant
        horizontalPosition += 200;
      }
      
      // Parse participant declarations
      const participantMatch = trimmedLine.match(/^\s*participant\s+([^\s:]+)/);
      if (participantMatch) {
        const participantId = `participant-${Date.now()}-${Object.keys(participantMap).length}`;
        const lifelineId = `lifeline-${Date.now()}-${Object.keys(participantMap).length}`;
        
        // Clean up the participant name
        const participantName = participantMatch[1].replace(/_/g, ' ');
        
        // Create participant node
        nodes.push({
          id: participantId,
          type: 'participant',
          position: { x: horizontalPosition, y: 50 },
          data: { 
            label: participantName,
            id: participantId
          }
        });
        
        // Create lifeline node
        nodes.push({
          id: lifelineId,
          type: 'lifeline',
          position: { x: horizontalPosition + 25, y: 120 },
          data: { 
            label: '', 
            participantId: participantId,
            height: 400,
            activations: [],
            id: lifelineId
          }
        });
        
        // Track participant for message connections
        participantMap[participantMatch[1]] = {
          id: participantId,
          lifelineId: lifelineId,
          position: horizontalPosition
        };
        
        // Increment position for next participant
        horizontalPosition += 200;
      }
      
      // Parse note declarations
      const noteMatch = trimmedLine.match(/^\s*Note\s+(?:over|right of|left of)\s+([^:,]+)(?:,\s*([^:]+))?:\s*(.*)/);
      if (noteMatch) {
        const noteId = `note-${Date.now()}-${nodes.length}`;
        const firstParticipant = participantMap[noteMatch[1]];
        const secondParticipant = noteMatch[2] ? participantMap[noteMatch[2]] : null;
        
        if (firstParticipant) {
          // Position note above the first referenced participant
          let noteX = firstParticipant.position;
          
          // If there's a second participant, center between them
          if (secondParticipant) {
            noteX = (firstParticipant.position + secondParticipant.position) / 2;
          }
          
          nodes.push({
            id: noteId,
            type: 'note',
            position: { x: noteX, y: 150 + (edges.length * 30) }, // Position based on number of existing edges
            data: {
              label: noteMatch[3] || 'Note'
            }
          });
        }
      }
      
      // Parse fragment declarations
      const fragmentMatch = trimmedLine.match(/^\s*(alt|opt|loop|par|critical|break|ref)\s*(.*)?/);
      if (fragmentMatch) {
        const fragmentId = `fragment-${Date.now()}-${nodes.length}`;
        const fragmentType = fragmentMatch[1];
        const condition = fragmentMatch[2] || '';
        
        // Since we don't know the exact participants yet, we'll create a fragment
        // spanning the entire diagram by default
        nodes.push({
          id: fragmentId,
          type: 'fragment',
          position: { x: 50, y: 180 + (edges.length * 30) }, // Position based on existing edges
          data: {
            fragmentType,
            condition,
            label: 'Fragment content',
            width: horizontalPosition - 50 + 100, // Span all participants
            height: 120
          }
        });
      }
      
      // Parse message declarations with various syntaxes
      const messageMatch = trimmedLine.match(/^\s*([^-\s]+)\s*(->>|-->|->|-->>|--x|-x)\s*([^:]+):\s*(.*)/);
      if (messageMatch) {
        const source = participantMap[messageMatch[1]];
        const target = participantMap[messageMatch[3]];
        const messageType = messageMatch[2];
        const messageLabel = messageMatch[4];
        
        if (source && target) {
          // Determine message type based on syntax
          let type = 'sync';
          if (messageType === '-->' || messageType === '->') {
            type = 'async';
          } else if (messageType === '--x' || messageType === '-x') {
            type = 'destroy';
          }
          
          // Create message edge
          edges.push({
            id: `edge-${source.lifelineId}-${target.lifelineId}-${edges.length}`,
            source: source.lifelineId,
            target: target.lifelineId,
            sourceHandle: 'right',
            targetHandle: 'left',
            data: {
              label: messageLabel,
              type
            },
            type: 'message',
            animated: false
          });
        }
      }
    });
    
    return { nodes, edges };
  }
  
  /**
   * Find the closest participant to a note node
   * 
   * @param {Object} note - The note node
   * @param {Array} participants - Array of participant nodes
   * @returns {Object|null} - The closest participant node or null if none found
   */
  function findClosestParticipant(note, participants) {
    if (!participants.length) return null;
    
    let closestParticipant = participants[0];
    let minDistance = Number.MAX_VALUE;
    
    participants.forEach(participant => {
      const distance = Math.abs(note.position.x - participant.position.x);
      if (distance < minDistance) {
        minDistance = distance;
        closestParticipant = participant;
      }
    });
    
    return closestParticipant;
  }
  
  /**
   * Find participants within a fragment's area
   * 
   * @param {Object} fragment - The fragment node
   * @param {Array} participants - Array of participant nodes
   * @returns {Array} - Participants that are within the fragment's area
   */
  function findParticipantsInFragment(fragment, participants) {
    const fragmentLeft = fragment.position.x;
    const fragmentRight = fragment.position.x + (fragment.data.width || 300);
    
    return participants.filter(participant => {
      const participantX = participant.position.x;
      return participantX >= fragmentLeft && participantX <= fragmentRight;
    });
  }
  
  /**
   * Normalize a sequence diagram - fix any issues with node positions
   * and ensure lifelines are properly aligned with their parents
   * 
   * @param {Array} nodes - ReactFlow nodes
   * @param {Array} edges - ReactFlow edges
   * @returns {Object} - { nodes, edges } with corrected positions
   */
  export function normalizeSequenceDiagram(nodes, edges) {
    if (!nodes || !edges) return { nodes, edges };
    
    // Find all participant and actor nodes
    const participants = nodes.filter(node => 
      node.type === 'actor' || node.type === 'participant'
    );
    
    // Fix participant positions - they should all be at the same Y position
    const participantY = 50;
    const normalizedNodes = nodes.map(node => {
      // Fix participant positions
      if (node.type === 'actor' || node.type === 'participant') {
        return {
          ...node,
          position: {
            ...node.position,
            y: participantY
          }
        };
      }
      
      // Fix lifeline positions to align with parents
      if (node.type === 'lifeline' && node.data?.participantId) {
        const parent = participants.find(p => p.id === node.data.participantId);
        if (parent) {
          return {
            ...node,
            position: {
              x: parent.position.x + 25, // Center under parent
              y: 120 // Fixed Y position
            },
            data: {
              ...node.data,
              parentX: parent.position.x,
              parentY: parent.position.y
            }
          };
        }
      }
      
      return node;
    });
    
    return { nodes: normalizedNodes, edges };
  }