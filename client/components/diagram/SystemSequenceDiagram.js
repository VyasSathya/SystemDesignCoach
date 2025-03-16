import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  ReactFlowProvider,
  Panel,
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
import { Server, Database, Users, GitBranch, GitMerge, GitPullRequest, Trash2, Edit } from 'lucide-react';

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
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-3 gap-4 p-4">
          {/* Left Section - Components */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">System Components</h3>
            <div className="grid grid-cols-3 gap-2">
              {menuItems.participants.map((item) => (
                <button
                  key={item.type}
                  onClick={() => onAddParticipant(item.type)}
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                >
                  {item.icon}
                  <span className="text-xs text-center text-gray-600 mt-2">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Middle Section - Message Types */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Communication Types</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onMessageTypeChange('sync')}
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
                onClick={() => onMessageTypeChange('async')}
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
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Control Flow</h3>
            <div className="grid grid-cols-2 gap-2">
              {menuItems.fragments.map((item) => (
                <button
                  key={item.type}
                  onClick={() => onAddFragment(item.type)}
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
const SystemSequenceDiagram = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLabel, setEditingLabel] = useState('');
  const [messageType, setMessageType] = useState('sync');
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [pendingNodeType, setPendingNodeType] = useState(null);
  const [newNodeName, setNewNodeName] = useState('');

  // Handle node changes
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  // Handle edge changes
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // Handle connections using ReactFlow's native connect mechanism
  const onConnect = useCallback(
    (params) => {
      // Create edge with current message type
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

  return (
    <div style={{ width: '100%', height: '80vh' }} className="relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={NODE_TYPES}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Control', 'Meta']}
        selectionKeyCode={['Shift']}
        snapToGrid={true}
        snapGrid={[15, 15]}
        connectionMode="strict"
        // Set to true to show connection lines while dragging
        connectionLineStyle={{ stroke: '#0096FF', strokeWidth: 2 }}
        connectionLineType="bezier"
      >
        <Background />
        <Controls />
        
        {/* Menu Panel */}
        <Panel position="bottom" className="w-full">
          <MenuPanel
            onAddParticipant={handleAddParticipant}
            onMessageTypeChange={handleMessageTypeChange}
            messageType={messageType}
            onAddFragment={handleAddFragment}
          />
        </Panel>

        {/* Name Input Dialog */}
        {showNameDialog && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h3 className="text-lg font-medium mb-4">Enter participant name</h3>
              <input
                type="text"
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateNamedNode();
                  }
                }}
                className="border px-3 py-2 rounded w-full mb-4"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowNameDialog(false);
                    setPendingNodeType(null);
                    setNewNodeName('');
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

        {/* Node Actions Panel */}
        <Panel position="top-right" className="bg-white p-2 rounded shadow-lg">
          {selectedNode && (
            <div className="flex gap-2">
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleEditLabel();
                      }
                    }}
                    className="border px-2 py-1 rounded"
                    autoFocus
                  />
                  <button
                    onClick={handleEditLabel}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    <Edit className="w-4 h-4" />
                    Rename
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </Panel>
        
        {/* Connection Instructions */}
        <Panel position="top-left" className="bg-white p-2 rounded shadow-lg m-2">
          <div className="text-xs text-gray-600">
            <strong>How to connect:</strong> Click and drag from a dot to another dot
          </div>
        </Panel>
      </ReactFlow>
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