// client/components/diagram/SequenceDiagram.js
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { memo } from 'react';
import ReactFlow, { 
  ReactFlowProvider, 
  Background, 
  Controls,
  Handle, 
  Position,
  addEdge,
  applyEdgeChanges, 
  applyNodeChanges,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { User, Server, ArrowRight, Plus, Edit, Trash2, ArrowDown } from 'lucide-react';

// Custom Node Types for Sequence Diagrams
const ActorNode = memo(({ data, selected }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-700' : 'border-blue-500'}`}>
    <div className="flex flex-col items-center">
      <User className="h-8 w-8 text-blue-500 mb-2" />
      <div className="text-xs text-blue-700 font-medium bg-blue-50 px-2 rounded mb-1">Actor</div>
      <div className="text-sm font-bold text-center">{data.label}</div>
    </div>
    <Handle
      type="source"
      position={Position.Bottom}
      id="bottom"
      isConnectable={false}
      className="w-3 h-3 bg-blue-500"
    />
  </div>
));

const ParticipantNode = memo(({ data, selected }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-purple-700' : 'border-purple-500'}`}>
    <div className="flex flex-col items-center">
      <Server className="h-8 w-8 text-purple-500 mb-2" />
      <div className="text-xs text-purple-700 font-medium bg-purple-50 px-2 rounded mb-1">Participant</div>
      <div className="text-sm font-bold text-center">{data.label}</div>
    </div>
    <Handle
      type="source"
      position={Position.Bottom}
      id="bottom"
      isConnectable={false}
      className="w-3 h-3 bg-purple-500"
    />
  </div>
));

const LifelineNode = memo(({ data, selected }) => (
  <div className={`sequence-lifeline-node ${selected ? 'border-l-2 border-gray-500' : ''}`} style={{ width: '2px', height: data.height || 300 }}>
    <div className="w-0.5 h-full bg-gray-300 mx-auto"></div>
    <Handle
      type="target"
      position={Position.Top}
      id="top"
      isConnectable={false}
      style={{ visibility: 'hidden' }}
      className="w-3 h-3 bg-gray-500"
    />
    {data.activations && data.activations.map((activation, index) => (
      <div 
        key={index}
        className="bg-gray-200 border border-gray-400"
        style={{
          position: 'absolute',
          width: '10px',
          height: `${activation.height}px`,
          left: '-4px',
          top: `${activation.top}px`,
        }}
      />
    ))}
    <Handle
      type="source"
      position={Position.Right}
      id="right"
      style={{ top: data.handlePos || '30%' }}
      className="w-3 h-3 bg-gray-500"
    />
    <Handle
      type="target"
      position={Position.Left}
      id="left"
      style={{ top: data.handlePos || '30%' }}
      className="w-3 h-3 bg-gray-500"
    />
  </div>
));

const MessageEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}) => {
  const edgePath = `M${sourceX},${sourceY} L${targetX},${targetY}`;
  const messageText = data?.label || '';
  const isReturn = data?.type === 'return';
  const isAsync = data?.type === 'async';
  
  // Calculate text positioning
  const textX = (sourceX + targetX) / 2;
  const textY = sourceY - 10; // Position text above the line
  
  return (
    <>
      <path
        id={id}
        style={{ 
          ...style, 
          strokeDasharray: isReturn || isAsync ? '5,5' : 'none',
          stroke: isReturn ? '#888' : '#333',
          strokeWidth: 1.5
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {messageText && (
        <text
          x={textX}
          y={textY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-gray-700 pointer-events-none"
          style={{ fontSize: 10 }}
        >
          {messageText}
        </text>
      )}
      {/* Arrow head */}
      <path
        d={`M${targetX - 5},${targetY - 5} L${targetX},${targetY} L${targetX - 5},${targetY + 5}`}
        style={{
          fill: 'none',
          stroke: isReturn ? '#888' : '#333',
          strokeWidth: 1.5
        }}
      />
    </>
  );
};

// Function to convert nodes and edges to mermaid syntax
function generateMermaidCode(nodes, edges) {
  if (!nodes || !edges) return '';
  
  const participants = nodes.filter(node => 
    node.type === 'actor' || node.type === 'participant'
  );
  
  // Start with sequence diagram declaration
  let code = 'sequenceDiagram\n';
  
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
  
  // Add messages
  sortedEdges.forEach(edge => {
    if (!edge.data?.label) return;
    
    // Find the lifelines
    const sourceLifeline = nodes.find(n => n.id === edge.source);
    const targetLifeline = nodes.find(n => n.id === edge.target);
    
    if (!sourceLifeline || !targetLifeline) return;
    
    // Find the parent participants of these lifelines
    const sourceParticipant = nodes.find(n => 
      (n.type === 'actor' || n.type === 'participant') && 
      sourceLifeline.data?.participantId === n.id
    );
    
    const targetParticipant = nodes.find(n => 
      (n.type === 'actor' || n.type === 'participant') && 
      targetLifeline.data?.participantId === n.id
    );
    
    if (!sourceParticipant || !targetParticipant) return;
    
    const sourceLabel = sourceParticipant.data.label.replace(/\s+/g, '_');
    const targetLabel = targetParticipant.data.label.replace(/\s+/g, '_');
    const messageLabel = edge.data.label;
    const messageType = edge.data.type || 'sync';
    
    if (messageType === 'sync') {
      code += `    ${sourceLabel}->>+${targetLabel}: ${messageLabel}\n`;
    } else if (messageType === 'async') {
      code += `    ${sourceLabel}-->>+${targetLabel}: ${messageLabel}\n`;
    } else if (messageType === 'return') {
      code += `    ${sourceLabel}-->>-${targetLabel}: ${messageLabel}\n`;
    }
  });
  
  return code;
}

// Helper function to create a new message with proper type
const createMessage = (sourceId, targetId, label, type = 'sync') => {
  return {
    id: `edge-${sourceId}-${targetId}-${Date.now()}`,
    source: sourceId,
    target: targetId,
    sourceHandle: 'right',
    targetHandle: 'left',
    data: { 
      label: label || 'Message',
      type: type
    },
    type: 'message',
    animated: false
  };
};

// Main Sequence Diagram Component
const SequenceDiagram = ({ initialDiagram, onDiagramUpdate }) => {
  // Define node and edge types
  const nodeTypes = {
    actor: ActorNode,
    participant: ParticipantNode,
    lifeline: LifelineNode
  };
  
  const edgeTypes = {
    message: MessageEdge
  };
  
  // State initialization
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const [messageType, setMessageType] = useState('sync');
  
  // Use refs to prevent circular updates
  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const mermaidCodeRef = useRef('');
  const isInitializedRef = useRef(false);
  const isMountedRef = useRef(false);
  const isUpdatingRef = useRef(false);
  
  // Initialize diagram only once
  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;
    
    if (isInitializedRef.current) return;
    
    let diagramNodes = [];
    let diagramEdges = [];
    
    try {
      if (initialDiagram && initialDiagram.nodes && initialDiagram.nodes.length > 0) {
        diagramNodes = [...initialDiagram.nodes];
        diagramEdges = initialDiagram.edges ? [...initialDiagram.edges] : [];
        
        if (initialDiagram.mermaidCode) {
          mermaidCodeRef.current = initialDiagram.mermaidCode;
        } else {
          mermaidCodeRef.current = generateMermaidCode(diagramNodes, diagramEdges);
        }
      } else {
        // Create default sequence diagram with two participants
        const timestamp = Date.now();
        const actor1Id = `actor-${timestamp}`;
        const actor2Id = `participant-${timestamp + 1}`;
        const lifeline1Id = `lifeline-${timestamp + 2}`;
        const lifeline2Id = `lifeline-${timestamp + 3}`;
        
        diagramNodes = [
          // Participants at the top
          { 
            id: actor1Id, 
            type: 'actor', 
            position: { x: 150, y: 50 }, 
            data: { label: 'User' } 
          },
          { 
            id: actor2Id, 
            type: 'participant', 
            position: { x: 350, y: 50 }, 
            data: { label: 'System' } 
          },
          // Lifelines below each participant
          {
            id: lifeline1Id,
            type: 'lifeline',
            position: { x: 175, y: 120 },
            data: { 
              label: '', 
              participantId: actor1Id,
              height: 400,
              activations: [] 
            }
          },
          {
            id: lifeline2Id,
            type: 'lifeline',
            position: { x: 375, y: 120 },
            data: { 
              label: '', 
              participantId: actor2Id,
              height: 400,
              activations: [] 
            }
          }
        ];
        
        diagramEdges = [
          createMessage(lifeline1Id, lifeline2Id, 'Request', 'sync')
        ];
        
        mermaidCodeRef.current = generateMermaidCode(diagramNodes, diagramEdges);
      }
      
      // Use update functions to batch state updates
      setNodes([...diagramNodes]);
      setEdges([...diagramEdges]);
      
      // Update refs
      nodesRef.current = diagramNodes;
      edgesRef.current = diagramEdges;
      
      isInitializedRef.current = true;
    } catch (error) {
      console.error("Error initializing sequence diagram:", error);
    }
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, [initialDiagram]);
  
  // Safe update function for nodes that prevents infinite updates
  const safeUpdateNodes = useCallback((updater) => {
    if (isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    setNodes((prevNodes) => {
      const newNodes = typeof updater === 'function' ? updater(prevNodes) : updater;
      nodesRef.current = newNodes;
      return newNodes;
    });
    
    // Reset update flag with small delay to allow batched updates
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  }, []);
  
  // Safe update function for edges that prevents infinite updates
  const safeUpdateEdges = useCallback((updater) => {
    if (isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    setEdges((prevEdges) => {
      const newEdges = typeof updater === 'function' ? updater(prevEdges) : updater;
      edgesRef.current = newEdges;
      return newEdges;
    });
    
    // Reset update flag with small delay to allow batched updates
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  }, []);
  
  // Update parent component with diagram changes
  const notifyDiagramUpdate = useCallback(() => {
    if (!isInitializedRef.current || !isMountedRef.current || isUpdatingRef.current) return;
    
    try {
      const newMermaidCode = generateMermaidCode(nodesRef.current, edgesRef.current);
      
      // Only update if the code has changed
      if (newMermaidCode !== mermaidCodeRef.current) {
        mermaidCodeRef.current = newMermaidCode;
        
        if (onDiagramUpdate && isMountedRef.current) {
          onDiagramUpdate({
            nodes: nodesRef.current,
            edges: edgesRef.current,
            mermaidCode: newMermaidCode
          });
        }
      }
    } catch (error) {
      console.error("Error updating mermaid code:", error);
    }
  }, [onDiagramUpdate]);
  
  // Update callback when nodes or edges change
  useEffect(() => {
    if (!isInitializedRef.current) return;
    
    nodesRef.current = nodes;
    edgesRef.current = edges;
    
    // Use debounced notification to prevent too many updates
    const timerId = setTimeout(() => {
      if (isMountedRef.current) {
        notifyDiagramUpdate();
      }
    }, 100);
    
    return () => clearTimeout(timerId);
  }, [nodes, edges, notifyDiagramUpdate]);
  
  // Handle node changes - with strict rules for sequence diagrams
  const onNodesChange = useCallback((changes) => {
    if (!isInitializedRef.current || isUpdatingRef.current) return;
    
    safeUpdateNodes((nds) => {
      try {
        // Apply standard changes first
        const updatedNodes = applyNodeChanges(changes, nds);
        
        // For position changes, enforce sequence diagram rules
        const positionChanges = changes.filter(change => change.type === 'position');
        if (positionChanges.length > 0) {
          return updatedNodes.map(node => {
            // Find if this node was moved
            const change = positionChanges.find(c => c.id === node.id);
            if (!change) return node;
            
            // For actors/participants, only allow horizontal movement
            if (node.type === 'actor' || node.type === 'participant') {
              const newY = 50; // Fix Y position at top
              
              // Update lifeline position to match
              const correspondingLifeline = updatedNodes.find(
                n => n.type === 'lifeline' && n.data?.participantId === node.id
              );
              
              if (correspondingLifeline) {
                // Update the lifeline's x position to match the participant
                const lifelineIndex = updatedNodes.findIndex(n => n.id === correspondingLifeline.id);
                if (lifelineIndex >= 0) {
                  updatedNodes[lifelineIndex] = {
                    ...updatedNodes[lifelineIndex],
                    position: {
                      x: node.position.x + 25, // Center the lifeline under the participant
                      y: updatedNodes[lifelineIndex].position.y
                    }
                  };
                }
              }
              
              return {
                ...node,
                position: {
                  x: node.position.x, // Allow X movement
                  y: newY // Fix Y position
                }
              };
            }
            
            // For lifelines, only allow vertical position changes
            if (node.type === 'lifeline') {
              // Find the associated participant
              const participant = updatedNodes.find(
                n => (n.type === 'actor' || n.type === 'participant') && n.id === node.data?.participantId
              );
              
              if (participant) {
                return {
                  ...node,
                  position: {
                    x: participant.position.x + 25, // Keep aligned with participant
                    y: node.position.y // Allow vertical movement
                  }
                };
              }
            }
            
            return node;
          });
        }
        
        return updatedNodes;
      } catch (error) {
        console.error("Error applying node changes:", error);
        return nds;
      }
    });
  }, [safeUpdateNodes]);
  
  // Handle edge changes
  const onEdgesChange = useCallback((changes) => {
    if (!isInitializedRef.current || isUpdatingRef.current) return;
    
    safeUpdateEdges((eds) => {
      try {
        // Just apply edge changes, no special logic needed
        return applyEdgeChanges(changes, eds);
      } catch (error) {
        console.error("Error applying edge changes:", error);
        return eds;
      }
    });
  }, [safeUpdateEdges]);
  
  // Handle connections - enforce sequence diagram rules
  const onConnect = useCallback((params) => {
    if (!isInitializedRef.current || isUpdatingRef.current) return;
    
    try {
      // Only allow connections between lifelines
      if (params.sourceHandle === 'right' && params.targetHandle === 'left') {
        // Create a message with proper formatting
        const newEdge = createMessage(
          params.source,
          params.target,
          'Message',
          messageType
        );
        
        safeUpdateEdges(eds => addEdge(newEdge, eds));
      }
    } catch (error) {
      console.error("Error connecting nodes:", error);
    }
  }, [messageType, safeUpdateEdges]);
  
  // Handle node selection
  const onNodeClick = useCallback((_, node) => {
    if (!isInitializedRef.current) return;
    
    setSelectedNode(node);
    setEditLabel(node.data?.label || '');
  }, []);
  
  // Handle edge selection for editing labels
  const onEdgeClick = useCallback((_, edge) => {
    if (!isInitializedRef.current) return;
    
    setSelectedNode(edge);
    setEditLabel(edge.data?.label || '');
  }, []);
  
  // Save edited label
  const saveNodeLabel = useCallback(() => {
    if (!isInitializedRef.current || !selectedNode || !editLabel.trim()) return;
    
    try {
      if (selectedNode.source) {
        // It's an edge
        safeUpdateEdges(eds => 
          eds.map(e => 
            e.id === selectedNode.id 
              ? { ...e, data: { ...e.data, label: editLabel } }
              : e
          )
        );
      } else {
        // It's a node
        safeUpdateNodes(nds => 
          nds.map(n => 
            n.id === selectedNode.id 
              ? { ...n, data: { ...n.data, label: editLabel } }
              : n
          )
        );
      }
      
      setEditMode(false);
    } catch (error) {
      console.error("Error saving label:", error);
    }
  }, [selectedNode, editLabel, safeUpdateEdges, safeUpdateNodes]);
  
  // Add a new actor
  const addActor = useCallback(() => {
    if (!isInitializedRef.current || isUpdatingRef.current) return;
    
    try {
      // Generate unique IDs for new nodes
      const timestamp = Date.now();
      const actorId = `actor-${timestamp}`;
      const lifelineId = `lifeline-${timestamp + 1}`;
      
      // Determine position (place new actor to the right of existing ones)
      const currentNodes = nodesRef.current;
      const lastX = Math.max(
        ...currentNodes
          .filter(n => n.type === 'actor' || n.type === 'participant')
          .map(n => n.position.x + 200),
        100 // default starting position if no nodes exist
      );
      
      const newActor = { 
        id: actorId, 
        type: 'actor', 
        position: { x: lastX, y: 50 }, 
        data: { label: 'New Actor' } 
      };
      
      const newLifeline = {
        id: lifelineId,
        type: 'lifeline',
        position: { x: lastX + 25, y: 120 }, // 25px offset to center under the actor
        data: { 
          label: '', 
          participantId: actorId,
          height: 400,
          activations: []
        }
      };
      
      safeUpdateNodes(nds => [...nds, newActor, newLifeline]);
    } catch (error) {
      console.error("Error adding actor:", error);
    }
  }, [safeUpdateNodes]);
  
  // Add a new participant (object)
  const addParticipant = useCallback(() => {
    if (!isInitializedRef.current || isUpdatingRef.current) return;
    
    try {
      // Generate unique IDs for new nodes
      const timestamp = Date.now();
      const participantId = `participant-${timestamp}`;
      const lifelineId = `lifeline-${timestamp + 1}`;
      
      // Determine position (place new participant to the right of existing ones)
      const currentNodes = nodesRef.current;
      const lastX = Math.max(
        ...currentNodes
          .filter(n => n.type === 'actor' || n.type === 'participant')
          .map(n => n.position.x + 200),
        100 // default starting position if no nodes exist
      );
      
      const newParticipant = { 
        id: participantId, 
        type: 'participant', 
        position: { x: lastX, y: 50 }, 
        data: { label: 'New Participant' } 
      };
      
      const newLifeline = {
        id: lifelineId,
        type: 'lifeline',
        position: { x: lastX + 25, y: 120 }, // 25px offset to center under the participant
        data: { 
          label: '', 
          participantId: participantId,
          height: 400,
          activations: []
        }
      };
      
      safeUpdateNodes(nds => [...nds, newParticipant, newLifeline]);
    } catch (error) {
      console.error("Error adding participant:", error);
    }
  }, [safeUpdateNodes]);
  
  // Delete selected node or edge
  const deleteSelected = useCallback(() => {
    if (!isInitializedRef.current || !selectedNode) return;
    
    try {
      if (selectedNode.source) {
        // It's an edge - simply remove it
        safeUpdateEdges(eds => eds.filter(e => e.id !== selectedNode.id));
      } else {
        // It's a node - handle based on type
        if (selectedNode.type === 'actor' || selectedNode.type === 'participant') {
          // Remove participant and its lifeline
          safeUpdateNodes(nds => nds.filter(n => 
            n.id !== selectedNode.id && n.data?.participantId !== selectedNode.id
          ));
          
          // Remove any edges connected to the lifeline
          const currentNodes = nodesRef.current;
          const lifeline = currentNodes.find(n => n.data?.participantId === selectedNode.id);
          if (lifeline) {
            safeUpdateEdges(eds => eds.filter(e => 
              e.source !== lifeline.id && e.target !== lifeline.id
            ));
          }
        } else if (selectedNode.type === 'lifeline') {
          // Cannot delete lifelines directly - must delete the participant instead
          const currentNodes = nodesRef.current;
          const participant = currentNodes.find(n => n.id === selectedNode.data?.participantId);
          if (participant) {
            safeUpdateNodes(nds => nds.filter(n => 
              n.id !== participant.id && n.id !== selectedNode.id
            ));
            
            // Remove any edges connected to this lifeline
            safeUpdateEdges(eds => eds.filter(e => 
              e.source !== selectedNode.id && e.target !== selectedNode.id
            ));
          }
        }
      }
      
      setSelectedNode(null);
      setEditMode(false);
    } catch (error) {
      console.error("Error deleting element:", error);
    }
  }, [selectedNode, safeUpdateNodes, safeUpdateEdges]);
  
  // Add a new message between two participants
  const addMessage = useCallback((type = 'sync') => {
    if (!isInitializedRef.current || isUpdatingRef.current) return;
    
    try {
      // Need at least two lifelines to add a message
      const currentNodes = nodesRef.current;
      const lifelines = currentNodes.filter(n => n.type === 'lifeline');
      if (lifelines.length < 2) return;
      
      // Get first two lifelines
      const [source, target] = lifelines.slice(0, 2);
      
      // Create a new message edge
      const newMessage = createMessage(source.id, target.id, 'New Message', type);
      
      safeUpdateEdges(eds => [...eds, newMessage]);
    } catch (error) {
      console.error("Error adding message:", error);
    }
  }, [safeUpdateEdges]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-3 border-b border-gray-200 flex justify-between">
        <div className="flex space-x-2">
          <button
            onClick={addActor}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Actor
          </button>
          <button
            onClick={addParticipant}
            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Participant
          </button>
          <div className="h-6 w-px bg-gray-300 mx-1"></div>
          <div className="flex border border-gray-300 rounded overflow-hidden">
            <button
              onClick={() => setMessageType('sync')}
              className={`px-2 py-1 text-xs ${messageType === 'sync' ? 'bg-indigo-500 text-white' : 'bg-gray-100'}`}
              title="Synchronous Message"
            >
              Sync
            </button>
            <button
              onClick={() => setMessageType('async')}
              className={`px-2 py-1 text-xs ${messageType === 'async' ? 'bg-indigo-500 text-white' : 'bg-gray-100'}`}
              title="Asynchronous Message"
            >
              Async
            </button>
            <button
              onClick={() => setMessageType('return')}
              className={`px-2 py-1 text-xs ${messageType === 'return' ? 'bg-indigo-500 text-white' : 'bg-gray-100'}`}
              title="Return Message"
            >
              Return
            </button>
          </div>
          <button
            onClick={() => addMessage(messageType)}
            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 flex items-center"
          >
            <ArrowRight size={16} className="mr-1" />
            Add Message
          </button>
          <button
            onClick={deleteSelected}
            className={`px-3 py-1 ${selectedNode ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} rounded-md flex items-center`}
            disabled={!selectedNode}
          >
            <Trash2 size={16} className="mr-1" />
            Delete
          </button>
        </div>
        
        {selectedNode && (
          <div className="flex items-center space-x-2">
            {editMode ? (
              <>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                  autoFocus
                />
                <button
                  onClick={saveNodeLabel}
                  className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
              >
                <Edit size={16} className="mr-1" />
                Edit Label
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Diagram Area */}
      <div className="flex-1 h-full" style={{ touchAction: 'none' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          minZoom={0.3}
          maxZoom={2}
          attributionPosition="bottom-left"
        >
          <Controls />
          <Background variant="dots" size={1} gap={16} color="#f0f0f0" />
          <Panel position="top-center" className="bg-white p-2 rounded shadow text-xs">
            <div className="flex items-center text-gray-500">
              <ArrowDown className="h-4 w-4 mr-1" />
              <span>Time flows downward</span>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

// Wrap with provider at the export level
const SequenceDiagramWrapped = (props) => (
  <ReactFlowProvider>
    <SequenceDiagram {...props} />
  </ReactFlowProvider>
);

export default SequenceDiagramWrapped;