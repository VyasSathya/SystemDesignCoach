import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  useReactFlow,
  useKeyPress,
  useOnSelectionChange
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Server, Database, Globe, Users, GitBranch, GitMerge, GitPullRequest, Trash2, Edit } from 'lucide-react';

// Node Types Definition
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

const BaseNode = ({ data, selected }) => {
  const style = getNodeStyle(data.type);
  
  return (
    <div className="group relative" style={{ minWidth: '120px' }}>
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
            {data.label || 'Unnamed'}
          </div>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!bottom-0 !bg-gray-400"
      />
      
      <div 
        className="absolute w-[2px] bg-gray-300"
        style={{
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          height: data.lifelineHeight || '400px',
          zIndex: -1
        }}
      />
    </div>
  );
};

// Define nodeTypes outside the component
const NODE_TYPES = {
  user: BaseNode,
  system: BaseNode,
  database: BaseNode
};

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

const SystemSequenceDiagram = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLabel, setEditingLabel] = useState('');
  const [messageType, setMessageType] = useState('sync');
  const [copiedElements, setCopiedElements] = useState(null);
  const [selectedElements, setSelectedElements] = useState([]);

  const { getNodes, getEdges, setNodes: setReactFlowNodes, setEdges: setReactFlowEdges } = useReactFlow();

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

  const handleNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setEditingLabel(node.data.label || '');
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter(
        (edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      setSelectedNode(null);
    }
  }, [selectedNode]);

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

  const handleAddParticipant = useCallback((type) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type,
      position: { x: nodes.length * 200, y: 0 },
      data: { label: `New ${type}`, type }
    };
    setNodes((nds) => [...nds, newNode]);
  }, [nodes]);

  const handleMessageTypeChange = useCallback((type) => {
    setMessageType(type);
  }, []);

  const handleAddFragment = useCallback((type) => {
    // Implement fragment addition logic
    console.log('Adding fragment:', type);
  }, []);

  // Selection change handler
  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      setSelectedElements([...nodes.map(n => n.id), ...edges.map(e => e.id)]);
    }
  });

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
      >
        <Background />
        <Controls />
        
        <Panel position="bottom" className="w-full">
          <MenuPanel
            menuItems={defaultMenuItems}
            onAddParticipant={handleAddParticipant}
            onMessageTypeChange={handleMessageTypeChange}
            messageType={messageType}
            onAddFragment={handleAddFragment}
          />
        </Panel>
      </ReactFlow>
    </div>
  );
};

const SystemSequenceDiagramWrapper = () => {
  return (
    <ReactFlowProvider>
      <SystemSequenceDiagram />
    </ReactFlowProvider>
  );
};

export default SystemSequenceDiagramWrapper;
