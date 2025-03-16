import React, { useState, useCallback, useEffect } from 'react';
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
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
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
            <h3 className="text-sm font-medium text-gray-700 mb-3">Message Type</h3>
            <div className="relative h-[76px]">
              <div className="absolute inset-0 grid grid-cols-2 gap-2 p-0.5 bg-gray-100 rounded-lg">
                {/* Sliding selector */}
                <div 
                  className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] transition-transform duration-200 ease-in-out
                    ${messageType === 'async' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}
                    bg-white rounded-md border border-gray-200 shadow-sm`}
                />
                
                {/* Clickable buttons */}
                <button
                  onClick={() => onMessageTypeChange('sync')}
                  className="relative z-10 p-3 flex flex-col items-center transition-colors duration-200"
                >
                  <SolidArrow className={`w-6 h-6 ${messageType === 'sync' ? 'text-blue-500' : 'text-gray-400'} mb-2`} />
                  <span className={`text-xs text-center font-medium ${messageType === 'sync' ? 'text-blue-500' : 'text-gray-400'}`}>
                    Synchronous
                  </span>
                </button>
                <button
                  onClick={() => onMessageTypeChange('async')}
                  className="relative z-10 p-3 flex flex-col items-center transition-colors duration-200"
                >
                  <AsyncArrow className={`w-6 h-6 ${messageType === 'async' ? 'text-blue-500' : 'text-gray-400'} mb-2`} />
                  <span className={`text-xs text-center font-medium ${messageType === 'async' ? 'text-blue-500' : 'text-gray-400'}`}>
                    Asynchronous
                  </span>
                </button>
              </div>
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
  const [nodes, setNodes] = useState([
    {
      id: '1',
      type: 'default',
      data: { label: 'Test Node 1' },
      position: { x: 100, y: 100 }
    },
    {
      id: '2',
      type: 'default',
      data: { label: 'Test Node 2' },
      position: { x: 300, y: 100 }
    }
  ]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [messageType, setMessageType] = useState('sync'); // Initialize as 'sync'
  const [isEditing, setIsEditing] = useState(false);
  const [editingLabel, setEditingLabel] = useState('');

  const onNodeClick = useCallback((event, node) => {
    console.log('Node clicked:', node);
    setSelectedNode(node);
  }, []);

  const handleNodeDelete = useCallback((nodeId) => {
    console.log('Deleting node:', nodeId);
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    ));
    setSelectedNode(null);
  }, []);

  const handleStartEdit = () => {
    if (selectedNode) {
      setEditingLabel(selectedNode.data.label);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (selectedNode) {
      handleNodeRename(selectedNode.id, editingLabel);
      setIsEditing(false);
    }
  };

  const handleNodeRename = useCallback((nodeId, newLabel) => {
    console.log('Renaming node:', nodeId, 'to:', newLabel);
    setNodes((nds) => 
      nds.map((node) => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      )
    );
  }, []);

  const handleAddParticipant = useCallback((type) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'default',
      data: { label: type.charAt(0).toUpperCase() + type.slice(1) },
      position: { x: Math.random() * 500, y: Math.random() * 300 }
    };
    console.log('Adding participant:', newNode);
    setNodes((nds) => [...nds, newNode]);
  }, []);

  const handleMessageTypeChange = useCallback((type) => {
    console.log('Message type changed to:', type);
    setMessageType(type);
  }, []);

  const handleAddFragment = useCallback((type) => {
    console.log('Adding fragment:', type);
    // TODO: Implement fragment addition logic
  }, []);

  return (
    <div className="flex flex-col h-full bg-white relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Control', 'Meta']}
        snapToGrid={true}
        snapGrid={[15, 15]}
      >
        <Background />
        <Controls />

        {/* Top-right controls */}
        {selectedNode && (
          <Panel position="top-right" className="flex gap-2 p-2">
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingLabel}
                  onChange={(e) => setEditingLabel(e.target.value)}
                  className="border px-2 py-1 rounded"
                  autoFocus
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
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md shadow-sm"
              >
                <Edit className="w-4 h-4" />
                Rename
              </button>
            )}
            <button
              onClick={() => handleNodeDelete(selectedNode.id)}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </Panel>
        )}
      </ReactFlow>

      <MenuPanel
        menuItems={defaultMenuItems}
        onAddParticipant={handleAddParticipant}
        onMessageTypeChange={handleMessageTypeChange}
        messageType={messageType}
        onAddFragment={handleAddFragment}
        selectedNode={selectedNode}
        onNodeDelete={handleNodeDelete}
        onNodeRename={handleNodeRename}
      />
    </div>
  );
};

export default SystemSequenceDiagram;
