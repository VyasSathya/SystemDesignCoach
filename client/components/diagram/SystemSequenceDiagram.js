'use client';

import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  ReactFlowProvider 
} from 'reactflow';
import 'reactflow/dist/style.css';

// Node styles definition
const getNodeStyle = (type) => {
  const styles = {
    user: {
      icon: Users,
      background: 'bg-blue-50',
      border: 'border-blue-300',
      hoverBg: 'hover:bg-blue-50',
      selectedBorder: 'border-blue-500',
      iconColor: 'text-blue-500'
    },
    system: {
      icon: Server,
      background: 'bg-green-50',
      border: 'border-green-300',
      hoverBg: 'hover:bg-green-50',
      selectedBorder: 'border-green-500',
      iconColor: 'text-green-500'
    },
    database: {
      icon: Database,
      background: 'bg-purple-50',
      border: 'border-purple-300',
      hoverBg: 'hover:bg-purple-50',
      selectedBorder: 'border-purple-500',
      iconColor: 'text-purple-500'
    }
  };
  return styles[type] || styles.system;
};

// Simplified BaseNode with ReactFlow native connection handles
const BaseNode = ({ data, selected, id }) => {
  const style = getNodeStyle(data.type);
  const IconComponent = style.icon;
  
  return (
    <div className="group relative" style={{ minWidth: '120px' }}>
      {/* Participant header */}
      <div className={`
        px-4 py-3 rounded-lg shadow-sm border-2 transition-all
        ${style.background}
        ${selected ? style.selectedBorder : style.border}
        ${style.hoverBg}
        hover:shadow-md
      `}>
        <div className="flex items-center gap-2 justify-center">
          <div className={`${style.iconColor}`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div className="text-sm font-medium text-gray-700">
            {data.label}
          </div>
        </div>
      </div>

      {/* Lifeline with connection points */}
      <div className="relative">
        <div
          className="absolute left-1/2 top-full border-l-2 border-gray-300"
          style={{
            height: data.lifelineHeight || '400px',
            transform: 'translateX(-50%)',
            zIndex: 1
          }}
        />
        
        {/* Connection points with native ReactFlow handles */}
        {Array.from({ length: 10 }).map((_, index) => {
          const yPos = (index + 1) * 40;
          
          return (
            <div
              key={`dot-${index}`}
              className="absolute w-3 h-3 rounded-full bg-white border-2 border-gray-400 hover:border-blue-500 hover:bg-blue-50"
              style={{
                left: '50%',
                top: `${yPos}px`,
                transform: 'translateX(-50%)',
                zIndex: 2
              }}
            >
              <Handle
                type="source"
                position={Position.Right}
                id={`${id}-source-${index}`}
                style={{ 
                  width: 10, 
                  height: 10,
                  right: -5,
                  background: 'transparent',
                  border: 'none'
                }}
              />
              <Handle
                type="target"
                position={Position.Left}
                id={`${id}-target-${index}`}
                style={{ 
                  width: 10, 
                  height: 10,
                  left: -5,
                  background: 'transparent',
                  border: 'none'
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Edge types definition
const MessageEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd
}) => {
  const edgePath = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {data?.label && (
        <text>
          <textPath
            href={`#${id}`}
            style={{ fontSize: '12px' }}
            startOffset="50%"
            textAnchor="middle"
          >
            {data.label}
          </textPath>
        </text>
      )}
    </>
  );
};

const EDGE_TYPES = {
  default: MessageEdge
};

// Node types definition
const NODE_TYPES = {
  user: BaseNode,
  system: BaseNode,
  database: BaseNode,
  default: BaseNode
};

// Menu panel component
const MenuPanel = ({ 
  onAddParticipant = () => {},
  onMessageTypeChange = () => {},
  messageType = 'sync',
  onAddFragment = () => {},
}) => {
  const preventDrag = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  // Define menu items with components instead of rendered elements
  const menuItems = {
    participants: [
      { type: 'user', label: 'User', Icon: Users },
      { type: 'system', label: 'System', Icon: Server },
      { type: 'database', label: 'Database', Icon: Database }
    ],
    fragments: [
      { type: 'loop', label: 'Loop', Icon: GitMerge },
      { type: 'alt', label: 'Alternative', Icon: GitPullRequest }
    ]
  };

  return (
    <div 
      className="w-full bg-white border-t border-gray-200"
      onMouseDown={preventDrag}
      onMouseMove={preventDrag}
      onClick={preventDrag}
      draggable={false}
      style={{ touchAction: 'none' }}
    >
      <div 
        className="max-w-[1200px] mx-auto"
        onDragStart={preventDrag}
        draggable={false}
      >
        <div 
          className="grid grid-cols-3 gap-4 p-4"
          draggable={false}
        >
          <div draggable={false}>
            <h3 className="text-sm font-medium text-gray-700 mb-3">System Components</h3>
            <div className="space-y-2">
              {menuItems.participants.map(({ type, label, Icon }) => (
                <button
                  key={type}
                  className="flex items-center gap-2 p-2 w-full rounded hover:bg-gray-50"
                  onClick={() => onAddParticipant(type)}
                >
                  <Icon className="w-6 h-6" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Message Type</h3>
            {/* Message type controls here */}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Fragments</h3>
            <div className="space-y-2">
              {menuItems.fragments.map(({ type, label, Icon }) => (
                <button
                  key={type}
                  className="flex items-center gap-2 p-2 w-full rounded hover:bg-gray-50"
                  onClick={() => onAddFragment(type)}
                >
                  <Icon className="w-6 h-6" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Sequence Diagram Component
const SystemSequenceDiagram = ({ problemId, userId, sessionId, initialData, onSave }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Initialize state using initialData or defaults
  const [nodes, setNodes] = useState(() => {
    const savedState = localStorage.getItem('currentSequenceDiagramState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return parsed.nodes || [];
    }
    return initialData?.nodes || [];
  });

  const [edges, setEdges] = useState(() => {
    const savedState = localStorage.getItem('currentSequenceDiagramState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return parsed.edges || [];
    }
    return initialData?.edges || [];
  });

  // Persistence effect
  useEffect(() => {
    if (!userId || !sessionId) return; // Add guard clause
    
    const state = {
      nodes,
      edges
    };
    workbookService.saveDiagram(userId, sessionId, state, 'sequence');
  }, [nodes, edges, userId, sessionId]);

  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLabel, setEditingLabel] = useState('');
  const [messageType, setMessageType] = useState('sync');
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [pendingNodeType, setPendingNodeType] = useState(null);
  const [newNodeName, setNewNodeName] = useState('');

  // Single declaration of onNodesChange
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        animated: messageType === 'async',
        style: {
          strokeDasharray: messageType === 'async' ? '5, 5' : 'none',
          strokeWidth: 2
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#000'
        },
        data: {
          label: 'Message',
          type: messageType
        }
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [messageType]
  );

  // Save state whenever nodes or edges change
  useEffect(() => {
    const state = {
      nodes,
      edges,
      mermaidCode: initialData?.mermaidCode || ''  // Use initialData instead of initialState
    };
    
    // Save to localStorage
    localStorage.setItem('currentSequenceDiagramState', JSON.stringify(state));
    
    // Call onSave prop if provided
    if (onSave) {
      onSave(state);
    }
  }, [nodes, edges, initialData?.mermaidCode, onSave]);

  const handleSave = () => {
    // Implement your save logic here
    console.log('Saving diagram:', { nodes, edges });
  };

  // Handle node click
  const handleNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setEditingLabel(node.data.label || '');
  }, []);

  // Handle delete selected node
  const handleDeleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter(
        (edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      setSelectedNode(null);
    }
  }, [selectedNode]);

  // Handle edit label
  const handleEditLabel = useCallback(() => {
    if (selectedNode && editingLabel.trim() !== '') {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, label: editingLabel } }
            : node
        )
      );
      setIsEditing(false);
      setSelectedNode(null);
    }
  }, [selectedNode, editingLabel]);

  // Handle add participant
  const handleAddParticipant = useCallback((type) => {
    setPendingNodeType(type);
    setNewNodeName(`New ${type.charAt(0).toUpperCase() + type.slice(1)}`);
    setShowNameDialog(true);
  }, []);

  // Handle create named node
  const handleCreateNamedNode = useCallback(() => {
    if (!newNodeName.trim() || !pendingNodeType) return;

    const newNode = {
      id: `node-${Date.now()}`,
      type: pendingNodeType,
      position: { x: nodes.length * 200, y: 0 },
      data: { 
        label: newNodeName.trim(),
        type: pendingNodeType,
        lifelineHeight: '400px'
      },
      draggable: true
    };

    setNodes((nds) => [...nds, newNode]);
    setShowNameDialog(false);
    setPendingNodeType(null);
    setNewNodeName('');
  }, [nodes, pendingNodeType, newNodeName]);

  // Handle message type change
  const handleMessageTypeChange = useCallback((type) => {
    setMessageType(type);
  }, []);

  // Handle add fragment
  const handleAddFragment = useCallback((type) => {
    console.log('Adding fragment:', type);
    // Implement fragment logic
  }, []);

  const onSaveAndContinue = useCallback(async () => {
    try {
      const diagramData = {
        nodes,
        edges,
        mermaidCode: initialData?.mermaidCode || ''  // Use initialData instead of initialState
      };
      
      // Save to localStorage
      localStorage.setItem('currentSequenceDiagramState', JSON.stringify(diagramData));
      
      // Call onSave prop
      if (onSave) {
        await onSave(diagramData);
      }
      
      console.log('Diagram saved successfully');
    } catch (error) {
      console.error('Error saving diagram:', error);
      // Here you might want to show an error notification to the user
    }
  }, [nodes, edges, initialData?.mermaidCode, onSave]);

  return (
    <div className="h-full flex flex-col">
      {/* ReactFlow container */}
      <div className="flex-1 relative">
        <div className="h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </div>

      {/* Menu Panel placed above the bottom control bar */}
      <div className="w-full">
        <MenuPanel 
          onAddParticipant={handleAddParticipant}
          onMessageTypeChange={handleMessageTypeChange}
          messageType={messageType}
          onAddFragment={handleAddFragment}
        />
      </div>

      {/* Bottom control bar with Ask Coach and Save & Continue buttons */}
      <div 
        className="flex justify-between items-center bg-white border-t border-gray-200 p-4 shadow-md" 
        style={{ position: 'relative', zIndex: 1000 }}
      >
        <button 
          className="flex items-center px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
          style={{ position: 'relative', zIndex: 1001 }}
        >
          <MessageSquare size={16} className="mr-2" />
          Ask Coach
        </button>
        <button 
          onClick={onSaveAndContinue}
          className="flex items-center px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
          style={{ position: 'relative', zIndex: 1001 }}
        >
          <Save size={16} className="mr-2" />
          Save & Continue
        </button>
      </div>

      {/* Add this dialog code right before the final closing div */}
      {showNameDialog && (
        <div className="absolute inset-0 flex items-center justify-center z-50" 
          style={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'auto'
          }}
        >
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <input
              type="text"
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
              className="border p-2 rounded"
              placeholder="Enter name"
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowNameDialog(false);
                  setPendingNodeType(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNamedNode}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export a wrapped version of the component
export default function WrappedSystemSequenceDiagram(props) {
  return (
    <ReactFlowProvider>
      <SystemSequenceDiagram {...props} />
    </ReactFlowProvider>
  );
}
