import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Panel,
  Background, 
  Controls,
  addEdge,
  applyEdgeChanges, 
  applyNodeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Server, Database, Globe, Users, GitBranch, GitMerge, GitPullRequest, Trash2, Edit } from 'lucide-react';

// Custom Arrow SVG Components
const SolidArrow = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M4 12H20" 
      stroke="currentColor" 
      strokeWidth="2"
    />
    <path 
      d="M13 6L20 12L13 18" 
      stroke="currentColor" 
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

const AsyncArrow = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Broken shaft with 2 gaps */}
    <path 
      d="M4 12H8" 
      stroke="currentColor" 
      strokeWidth="2"
    />
    <path 
      d="M11 12H15" 
      stroke="currentColor" 
      strokeWidth="2"
    />
    <path 
      d="M18 12H20" 
      stroke="currentColor" 
      strokeWidth="2"
    />
    {/* Solid arrowhead */}
    <path 
      d="M13 6L20 12L13 18" 
      stroke="currentColor" 
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

// Icon mapping object
const iconMap = {
  server: Server,
  database: Database,
  globe: Globe,
  users: Users,
  solidArrow: SolidArrow,
  asyncArrow: AsyncArrow,
  gitBranch: GitBranch,
  gitMerge: GitMerge,
  gitPullRequest: GitPullRequest
};

// Default menu items
const defaultMenuItems = {
  participants: [
    { type: 'user', label: 'User', iconName: 'users', color: 'blue' },
    { type: 'system', label: 'System', iconName: 'server', color: 'green' },
    { type: 'database', label: 'Database', iconName: 'database', color: 'purple' }
  ],
  messageTypes: [
    { type: 'sync', label: 'Synchronous', iconName: 'solidArrow', color: 'blue' },
    { type: 'async', label: 'Asynchronous', iconName: 'asyncArrow', color: 'green' }
  ],
  fragments: [
    { type: 'loop', label: 'Loop', iconName: 'gitMerge', color: 'purple' },
    { type: 'alt', label: 'Alternative', iconName: 'gitPullRequest', color: 'orange' }
  ]
};

const MenuPanel = ({ 
  menuItems = defaultMenuItems,
  onAddParticipant = () => {},
  onMessageTypeChange = () => {},
  messageType = null,
  onAddFragment = () => {},
  selectedNode = null,
  onNodeDelete,
  onNodeRename
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingLabel, setEditingLabel] = useState('');

  const handleStartEdit = () => {
    if (selectedNode) {
      setEditingLabel(selectedNode.data.label);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (selectedNode && onNodeRename) {
      onNodeRename(selectedNode.id, editingLabel);
      setIsEditing(false);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      {/* Node Operations Panel */}
      {selectedNode && (
        <div className="p-4 border-b bg-white">
          <h3 className="font-semibold mb-2">Selected Node: {selectedNode.data.label}</h3>
          <div className="flex gap-2">
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingLabel}
                  onChange={(e) => setEditingLabel(e.target.value)}
                  className="border px-2 py-1 rounded"
                />
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                <Edit className="w-4 h-4" />
                Rename
              </button>
            )}
            <button
              onClick={() => onNodeDelete && onNodeDelete(selectedNode.id)}
              className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Existing MenuPanel content */}
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-3 gap-4 p-4">
          {/* Left Section: Add Participants */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add Participants</h3>
            <div className="grid grid-cols-3 gap-2">
              {menuItems.participants.map((item) => {
                const Icon = iconMap[item.iconName];
                return (
                  <button
                    key={item.type}
                    onClick={() => onAddParticipant(item.type)}
                    className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                  >
                    {Icon && <Icon className={`w-6 h-6 text-${item.color}-500 mb-2`} />}
                    <span className="text-xs text-center text-gray-600">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Middle Section: Message Types */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Message Types</h3>
            <div className="grid grid-cols-2 gap-2">
              {menuItems.messageTypes.map((item) => {
                const Icon = iconMap[item.iconName];
                return (
                  <button
                    key={item.type}
                    onClick={() => onMessageTypeChange(item.type)}
                    className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                      messageType === item.type 
                        ? `bg-${item.color}-50 border-${item.color}-200` 
                        : 'hover:bg-gray-50 border-gray-200'
                    } border`}
                  >
                    {Icon && <Icon className={`w-6 h-6 text-${item.color}-500 mb-2`} />}
                    <span className="text-xs text-center text-gray-600">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Section: Fragments */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Interaction Patterns</h3>
            <div className="grid grid-cols-2 gap-2">
              {menuItems.fragments.map((item) => {
                const Icon = iconMap[item.iconName];
                return (
                  <button
                    key={item.type}
                    onClick={() => onAddFragment(item.type)}
                    className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                  >
                    {Icon && <Icon className={`w-6 h-6 text-${item.color}-500 mb-2`} />}
                    <span className="text-xs text-center text-gray-600">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Update the main component to handle node selection and operations
const SystemSequenceDiagram = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLabel, setEditingLabel] = useState('');
  const [messageType, setMessageType] = useState('sync');

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const handleNodeDelete = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    setSelectedNode(null);
  }, []);

  const handleAddParticipant = useCallback((type) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: type,
      position: { x: Math.random() * 500, y: Math.random() * 300 },
      data: { 
        label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        type: type
      }
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  const handleMessageTypeChange = useCallback((type) => {
    setMessageType(type);
  }, []);

  const handleAddFragment = useCallback((type) => {
    // Implementation for adding fragments (loop, alt, etc.)
    console.log('Adding fragment:', type);
  }, []);

  const handleStartEdit = () => {
    if (selectedNode) {
      setEditingLabel(selectedNode.data.label);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (selectedNode) {
      setNodes((nds) => nds.map((node) => {
        if (node.id === selectedNode.id) {
          const updatedNode = {
            ...node,
            data: { ...node.data, label: editingLabel }
          };
          setSelectedNode(updatedNode);
          return updatedNode;
        }
        return node;
      }));
      setIsEditing(false);
    }
  };

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-grow relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
          }}
        >
          <Background color="#f0f0f0" gap={16} />
          <Controls />
          
          {/* Node controls panel */}
          {selectedNode && (
            <Panel position="top-right" className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Selected: {selectedNode.data.label}
                </div>
                
                <div className="flex gap-2">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingLabel}
                        onChange={(e) => setEditingLabel(e.target.value)}
                        className="border px-2 py-1 rounded text-sm"
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleStartEdit}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Rename
                    </button>
                  )}
                  <button
                    onClick={() => handleNodeDelete(selectedNode.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {/* Bottom Menu Panel */}
      <MenuPanel
        menuItems={defaultMenuItems}
        onAddParticipant={handleAddParticipant}
        onMessageTypeChange={handleMessageTypeChange}
        messageType={messageType}
        onAddFragment={handleAddFragment}
        selectedNode={selectedNode}
        onNodeDelete={handleNodeDelete}
        onNodeRename={handleSaveEdit}
      />
    </div>
  );
};

export default SystemSequenceDiagram;
