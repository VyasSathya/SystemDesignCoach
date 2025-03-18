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
import { Server, Database, Users, GitBranch, GitMerge, GitPullRequest, Trash2, Edit, MessageSquare, Save, Wand2 } from 'lucide-react';
import MessageEdge from './components/MessageEdge';
import ArrowMarkers from './components/ArrowMarkers';

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

  const onSaveAndContinue = async () => {
    try {
      // Save the current diagram state
      const diagramData = {
        nodes,
        edges
      };
      
      console.log('Saving diagram:', diagramData);
      // Here you would typically make an API call to save the data
      
      // For now, just log it
      console.log('Diagram saved successfully');
    } catch (error) {
      console.error('Error saving diagram:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ReactFlowProvider>
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            fitView
          >
            <Background />
            <Controls />
            <MenuPanel 
              onAddParticipant={handleAddParticipant}
              onMessageTypeChange={handleMessageTypeChange}
              messageType={messageType}
              onAddFragment={handleAddFragment}
            />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
      
      <div className="sticky bottom-0 w-full bg-white border-t border-gray-200 p-4 flex justify-between items-center shadow-md">
        <button className="flex items-center px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors">
          <MessageSquare size={16} className="mr-2" />
          Ask Coach
        </button>
        <button 
          onClick={onSaveAndContinue}
          className="flex items-center px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Save size={16} className="mr-2" />
          Save & Continue
        </button>
      </div>
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