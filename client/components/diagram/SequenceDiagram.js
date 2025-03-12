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
import { User, Server, ArrowRight, Plus, Edit, Trash2 } from 'lucide-react';

// Custom Node Types for Sequence Diagrams
const ActorNode = memo(({ data, selected }) => (
  <div 
    className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-700' : 'border-blue-500'}`}
  >
    <div className="flex flex-col items-center">
      <User className="h-8 w-8 text-blue-500 mb-2" />
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
  <div 
    className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-purple-700' : 'border-purple-500'}`}
  >
    <div className="flex flex-col items-center">
      <Server className="h-8 w-8 text-purple-500 mb-2" />
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
  <div 
    className={`sequence-lifeline-node ${selected ? 'border-l-2 border-gray-500' : ''}`} 
    style={{ width: '2px', height: 400 }}
  >
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
      className="w-3 h-3 bg-gray-500"
    />
    <Handle
      type="target"
      position={Position.Left}
      id="left"
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
  data,
  style = {},
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
      />
      {messageText && (
        <text
          x={textX}
          y={textY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-gray-700"
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
  const [selectedElement, setSelectedElement] = useState(null);
  const [messageType, setMessageType] = useState('sync');
  const [editingLabel, setEditingLabel] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
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
        // Use the provided diagram data
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
            data: { 
              label: 'User',
              id: actor1Id
            } 
          },
          { 
            id: actor2Id, 
            type: 'participant', 
            position: { x: 350, y: 50 }, 
            data: { 
              label: 'System',
              id: actor2Id
            } 
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
              activations: [],
              id: lifeline1Id
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
              activations: [],
              id: lifeline2Id
            }
          }
        ];
        
        diagramEdges = [
          {
            id: `edge-${lifeline1Id}-${lifeline2Id}-${timestamp}`,
            source: lifeline1Id,
            target: lifeline2Id,
            sourceHandle: 'right',
            targetHandle: 'left',
            data: { 
              label: 'Request',
              type: 'sync'
            },
            type: 'message',
            animated: false
          }
        ];
        
        mermaidCodeRef.current = generateMermaidCode(diagramNodes, diagramEdges);
      }
      
      // Set initial state
      safeSetNodes(diagramNodes);
      safeSetEdges(diagramEdges);
      
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
  
  // Safe update functions to prevent infinite loops
  const safeSetNodes = useCallback((newNodes) => {
    if (isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    setNodes(newNodes);
    nodesRef.current = newNodes;
    
    // Reset the flag after a small delay
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  }, []);
  
  const safeSetEdges = useCallback((newEdges) => {
    if (isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    setEdges(newEdges);
    edgesRef.current = newEdges;
    
    // Reset the flag after a small delay
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  }, []);
  
  // Update mermaid code whenever nodes or edges change
  useEffect(() => {
    if (!isInitializedRef.current || isUpdatingRef.current) return;
    
    // We've already updated refs in safeSet* functions
    const newMermaidCode = generateMermaidCode(nodesRef.current, edgesRef.current);
    
    // Only update if code has changed
    if (newMermaidCode !== mermaidCodeRef.current) {
      mermaidCodeRef.current = newMermaidCode;
      
      // Notify parent if callback exists
      if (onDiagramUpdate && isMountedRef.current) {
        onDiagramUpdate({
          nodes: nodesRef.current,
          edges: edgesRef.current,
          mermaidCode: newMermaidCode
        });
      }
    }
  }, [nodes, edges, onDiagramUpdate]);
  
  // Handle node changes - with strict rules for sequence diagrams
  const onNodesChange = useCallback((changes) => {
    if (!isInitializedRef.current || isUpdatingRef.current) return;
    
    const updatedNodes = applyNodeChanges(changes, nodesRef.current);
    
    // For position changes, enforce sequence diagram rules
    const positionChanges = changes.filter(change => change.type === 'position');
    if (positionChanges.length > 0) {
      const finalNodes = updatedNodes.map(node => {
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
      
      safeSetNodes(finalNodes);
    } else {
      safeSetNodes(updatedNodes);
    }
  }, [safeSetNodes]);
  
  // Handle edge changes
  const onEdgesChange = useCallback((changes) => {
    if (!isInitializedRef.current || isUpdatingRef.current) return;
    
    const updatedEdges = applyEdgeChanges(changes, edgesRef.current);
    safeSetEdges(updatedEdges);
  }, [safeSetEdges]);
  
  // Handle connections - enforce sequence diagram rules
  const onConnect = useCallback((params) => {
    if (!isInitializedRef.current || isUpdatingRef.current) return;
    
    // Only allow connections between lifelines
    if (params.sourceHandle === 'right' && params.targetHandle === 'left') {
      const newEdge = {
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        source: params.source,
        target: params.target,
        sourceHandle: 'right',
        targetHandle: 'left',
        data: { 
          label: 'New Message',
          type: messageType
        },
        type: 'message',
        animated: false
      };
      
      const newEdges = addEdge(newEdge, edgesRef.current);
      safeSetEdges(newEdges);
      
      // Select the new edge
      setSelectedElement(newEdge);
      setIsEditing(true);
      setEditingLabel('New Message');
    }
  }, [messageType, safeSetEdges]);
  
  // Handle node selection
  const onNodeClick = useCallback((_, node) => {
    if (!isInitializedRef.current) return;
    
    if (node.type === 'actor' || node.type === 'participant') {
      setSelectedElement(node);
      setEditingLabel(node.data?.label || '');
      setIsEditing(false);
    }
  }, []);
  
  // Handle edge selection
  const onEdgeClick = useCallback((_, edge) => {
    if (!isInitializedRef.current) return;
    
    setSelectedElement(edge);
    setEditingLabel(edge.data?.label || '');
    setIsEditing(false);
  }, []);
  
  // Save edited label
  const saveLabel = useCallback(() => {
    if (!isInitializedRef.current || !selectedElement || !editingLabel.trim()) return;
    
    if (selectedElement.source) {
      // It's an edge
      const updatedEdges = edgesRef.current.map(e => 
        e.id === selectedElement.id 
          ? { ...e, data: { ...e.data, label: editingLabel } }
          : e
      );
      safeSetEdges(updatedEdges);
    } else {
      // It's a node
      const updatedNodes = nodesRef.current.map(n => 
        n.id === selectedElement.id 
          ? { ...n, data: { ...n.data, label: editingLabel } }
          : n
      );
      safeSetNodes(updatedNodes);
    }
    
    setIsEditing(false);
  }, [selectedElement, editingLabel, safeSetEdges, safeSetNodes]);
  
  // Add a new actor
  const addActor = useCallback(() => {
    if (!isInitializedRef.current || isUpdatingRef.current) return;
    
    // Generate unique IDs for new nodes
    const timestamp = Date.now();
    const actorId = `actor-${timestamp}`;
    const lifelineId = `lifeline-${timestamp + 1}`;
    
    // Determine position (place new actor to the right of existing ones)
    const lastX = Math.max(
      ...nodesRef.current
        .filter(n => n.type === 'actor' || n.type === 'participant')
        .map(n => n.position.x + 200),
      100 // default starting position if no nodes exist
    );
    
    const newActor = { 
      id: actorId, 
      type: 'actor', 
      position: { x: lastX, y: 50 }, 
      data: { 
        label: 'New Actor',
        id: actorId
      } 
    };
    
    const newLifeline = {
      id: lifelineId,
      type: 'lifeline',
      position: { x: lastX + 25, y: 120 },
      data: { 
        label: '', 
        participantId: actorId,
        height: 400,
        activations: [],
        id: lifelineId
      }
    };
    
    const updatedNodes = [...nodesRef.current, newActor, newLifeline];
    safeSetNodes(updatedNodes);
    
    // Select the new actor for immediate editing
    setSelectedElement(newActor);
    setEditingLabel('New Actor');
    setIsEditing(true);
  }, [safeSetNodes]);
  
  // Add a new participant (object)
  const addParticipant = useCallback(() => {
    if (!isInitializedRef.current || isUpdatingRef.current) return;
    
    // Generate unique IDs for new nodes
    const timestamp = Date.now();
    const participantId = `participant-${timestamp}`;
    const lifelineId = `lifeline-${timestamp + 1}`;
    
    // Determine position (place new participant to the right of existing ones)
    const lastX = Math.max(
      ...nodesRef.current
        .filter(n => n.type === 'actor' || n.type === 'participant')
        .map(n => n.position.x + 200),
      100 // default starting position if no nodes exist
    );
    
    const newParticipant = { 
      id: participantId, 
      type: 'participant', 
      position: { x: lastX, y: 50 }, 
      data: { 
        label: 'New Participant',
        id: participantId
      } 
    };
    
    const newLifeline = {
      id: lifelineId,
      type: 'lifeline',
      position: { x: lastX + 25, y: 120 },
      data: { 
        label: '', 
        participantId: participantId,
        height: 400,
        activations: [],
        id: lifelineId
      }
    };
    
    const updatedNodes = [...nodesRef.current, newParticipant, newLifeline];
    safeSetNodes(updatedNodes);
    
    // Select the new participant for immediate editing
    setSelectedElement(newParticipant);
    setEditingLabel('New Participant');
    setIsEditing(true);
  }, [safeSetNodes]);
  
  // Delete selected element
  const deleteSelected = useCallback(() => {
    if (!isInitializedRef.current || !selectedElement) return;
    
    if (selectedElement.source) {
      // It's an edge - simply remove it
      const updatedEdges = edgesRef.current.filter(e => e.id !== selectedElement.id);
      safeSetEdges(updatedEdges);
    } else {
      // It's a node
      if (selectedElement.type === 'actor' || selectedElement.type === 'participant') {
        // Remove participant and its lifeline
        const updatedNodes = nodesRef.current.filter(n => 
          n.id !== selectedElement.id && n.data?.participantId !== selectedElement.id
        );
        safeSetNodes(updatedNodes);
        
        // Remove any edges connected to the lifeline
        const lifeline = nodesRef.current.find(n => n.data?.participantId === selectedElement.id);
        if (lifeline) {
          const updatedEdges = edgesRef.current.filter(e => 
            e.source !== lifeline.id && e.target !== lifeline.id
          );
          safeSetEdges(updatedEdges);
        }
      }
    }
    
    setSelectedElement(null);
    setIsEditing(false);
  }, [selectedElement, safeSetNodes, safeSetEdges]);
  
  // Add a new message between existing lifelines
  const addMessage = useCallback(() => {
    if (!isInitializedRef.current || isUpdatingRef.current) return;
    
    // Need at least two lifelines to add a message
    const lifelines = nodesRef.current.filter(n => n.type === 'lifeline');
    if (lifelines.length < 2) return;
    
    // Get first two lifelines
    const [source, target] = lifelines.slice(0, 2);
    
    // Create a new message edge
    const newEdge = {
      id: `edge-${source.id}-${target.id}-${Date.now()}`,
      source: source.id,
      target: target.id,
      sourceHandle: 'right',
      targetHandle: 'left',
      data: { 
        label: 'New Message',
        type: messageType
      },
      type: 'message',
      animated: false
    };
    
    const updatedEdges = [...edgesRef.current, newEdge];
    safeSetEdges(updatedEdges);
    
    // Select the new message for immediate editing
    setSelectedElement(newEdge);
    setEditingLabel('New Message');
    setIsEditing(true);
  }, [messageType, safeSetEdges]);
  
  // Enable editing mode for the selected element
  const startEditing = useCallback(() => {
    if (!selectedElement) return;
    
    // Set the label based on selected element type
    if (selectedElement.source) {
      // It's an edge
      setEditingLabel(selectedElement.data?.label || '');
    } else {
      // It's a node
      setEditingLabel(selectedElement.data?.label || '');
    }
    
    setIsEditing(true);
  }, [selectedElement]);
  
  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <div className="flex space-x-2 items-center">
          <span className="text-sm font-semibold mr-2">Add:</span>
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
            Object
          </button>
          <span className="text-sm font-semibold mx-2">Message:</span>
          <select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="sync">Synchronous</option>
            <option value="async">Asynchronous</option>
            <option value="return">Return</option>
          </select>
          <button
            onClick={addMessage}
            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 flex items-center"
          >
            <ArrowRight size={16} className="mr-1" />
            Add Message
          </button>
          {selectedElement && (
            <button
              onClick={deleteSelected}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center"
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </button>
          )}
        </div>
        
        {selectedElement && (
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={editingLabel}
                  onChange={(e) => setEditingLabel(e.target.value)}
                  className="border border-gray-300 rounded-l px-2 py-1 text-sm"
                  autoFocus
                />
                <button
                  onClick={saveLabel}
                  className="px-3 py-1 bg-green-500 text-white rounded-r hover:bg-green-600 text-sm"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={startEditing}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
              >
                <Edit size={16} className="mr-1" />
                Rename
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Diagram Area */}
      <div className="flex-1 h-full relative" style={{ touchAction: 'none' }}>
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
          defaultEdgeOptions={{
            type: 'message'
          }}
        >
          <Controls />
          <Background variant="dots" size={1} gap={16} color="#f0f0f0" />
          <Panel position="bottom-right" className="bg-white py-1 px-2 rounded shadow text-xs text-gray-500">
            Time flows downward
          </Panel>
        </ReactFlow>
        
        {/* Simple instructions */}
        <div className="absolute top-2 left-2 bg-white p-2 rounded shadow-md border border-gray-200 text-xs">
          <p>• Click on elements to select them</p>
          <p>• Use the Rename button to edit labels</p>
          <p>• Connect lifelines (vertical lines) to create messages</p>
          <p>• Drag actors/objects horizontally to arrange them</p>
        </div>
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