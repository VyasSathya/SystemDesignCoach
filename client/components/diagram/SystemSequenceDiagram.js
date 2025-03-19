import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  ReactFlowProvider,
  Background, 
  Controls,
  addEdge,
  applyEdgeChanges, 
  applyNodeChanges,
  Handle,
  Position,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Server, Database, Users, GitMerge, GitPullRequest, MessageSquare, Save } from 'lucide-react';
import MessageEdge from './components/MessageEdge';


// Node styles definition
const getNodeStyle = (type) => {
  const styles = {
    user: {
      icon: <Users className="w-6 h-6" />,
      background: 'bg-blue-50',
      border: 'border-blue-300',
      hoverBg: 'hover:bg-blue-50',
      selectedBorder: 'border-blue-500',
      iconColor: 'text-blue-500'
    },
    system: {
      icon: <Server className="w-6 h-6" />,
      background: 'bg-green-50',
      border: 'border-green-300',
      hoverBg: 'hover:bg-green-50',
      selectedBorder: 'border-green-500',
      iconColor: 'text-green-500'
    },
    database: {
      icon: <Database className="w-6 h-6" />,
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
            {style.icon}
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

  // Define menu items
  const menuItems = {
    participants: [
      { type: 'user', label: 'User', icon: <Users className="w-6 h-6 text-blue-500" /> },
      { type: 'system', label: 'System', icon: <Server className="w-6 h-6 text-green-500" /> },
      { type: 'database', label: 'Database', icon: <Database className="w-6 h-6 text-purple-500" /> }
    ],
    fragments: [
      { type: 'loop', label: 'Loop', icon: <GitMerge className="w-6 h-6 text-purple-500" /> },
      { type: 'alt', label: 'Alternative', icon: <GitPullRequest className="w-6 h-6 text-orange-500" /> }
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
          {/* Left Section - Components */}
          <div draggable={false}>
            <h3 className="text-sm font-medium text-gray-700 mb-3">System Components</h3>
            <div className="grid grid-cols-3 gap-2">
              {menuItems.participants.map((item) => (
                <button
                  key={item.type}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddParticipant(item.type);
                  }}
                  draggable={false}
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                >
                  {item.icon}
                  <span className="text-xs text-center text-gray-600 mt-2">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Middle Section - Message Types */}
          <div draggable={false}>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Communication Types</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMessageTypeChange('sync');
                }}
                draggable={false}
                className={`p-3 flex flex-col items-center rounded-lg border transition-colors
                  ${messageType === 'sync' ? 'bg-blue-50 border-blue-300' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M1 8H12" stroke="currentColor" strokeWidth="2" />
                    <path d="M8 4L12 8L8 12" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </div>
                <span className={`text-xs text-center font-medium mt-2 ${messageType === 'sync' ? 'text-blue-500' : 'text-gray-400'}`}>
                  Synchronous
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMessageTypeChange('async');
                }}
                draggable={false}
                className={`p-3 flex flex-col items-center rounded-lg border transition-colors
                  ${messageType === 'async' ? 'bg-blue-50 border-blue-300' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M1 8H4" stroke="currentColor" strokeWidth="2" />
                    <path d="M6 8H10" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
                    <path d="M8 4L12 8L8 12" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </div>
                <span className={`text-xs text-center font-medium mt-2 ${messageType === 'async' ? 'text-blue-500' : 'text-gray-400'}`}>
                  Asynchronous
                </span>
              </button>
            </div>
          </div>

          {/* Right Section - Control Flow */}
          <div draggable={false}>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Control Flow</h3>
            <div className="grid grid-cols-2 gap-2">
              {menuItems.fragments.map((item) => (
                <button
                  key={item.type}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddFragment(item.type);
                  }}
                  draggable={false}
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                >
                  {item.icon}
                  <span className="text-xs text-center text-gray-600 mt-2">{item.label}</span>
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
const SystemSequenceDiagram = ({ initialState = null, onSave }) => {
  // Initialize state from props first, then localStorage as fallback
  const [nodes, setNodes] = useState(() => {
    if (initialState?.nodes) {
      return initialState.nodes;
    }
    const savedState = localStorage.getItem('currentSequenceDiagramState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        return parsed.nodes;
      } catch (e) {
        console.error('Failed to parse saved state:', e);
      }
    }
    return [
      {
        id: '1',
        type: 'user',
        position: { x: 150, y: 50 },
        data: { label: 'User' }
      },
      {
        id: '2',
        type: 'system',
        position: { x: 300, y: 50 },
        data: { label: 'System' }
      }
    ];
  });

  const [edges, setEdges] = useState(() => {
    if (initialState?.edges) {
      return initialState.edges;
    }
    const savedState = localStorage.getItem('currentSequenceDiagramState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        return parsed.edges;
      } catch (e) {
        console.error('Failed to parse saved state:', e);
      }
    }
    return [];
  });

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
      mermaidCode: initialState?.mermaidCode || ''
    };
    
    // Save to localStorage
    localStorage.setItem('currentSequenceDiagramState', JSON.stringify(state));
    
    // Call onSave prop if provided
    if (onSave) {
      onSave(state);
    }
  }, [nodes, edges, initialState?.mermaidCode, onSave]);

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
        mermaidCode: initialState?.mermaidCode || ''
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
  }, [nodes, edges, initialState?.mermaidCode, onSave]);

  return (
    <div className="h-full flex flex-col">
      {/* ReactFlow container */}
      <div className="flex-1 relative">
        <ReactFlowProvider>
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
        </ReactFlowProvider>
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

// Wrapper with Provider
const SystemSequenceDiagramWrapper = () => {
  return (
    <ReactFlowProvider>
      <SystemSequenceDiagram />
    </ReactFlowProvider>
  );
};

export default SystemSequenceDiagramWrapper;
