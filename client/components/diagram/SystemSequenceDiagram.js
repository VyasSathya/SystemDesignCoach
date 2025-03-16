import React, { useState, useCallback, useMemo, useEffect, useContext } from 'react';
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

// Add this context at the top of your file
const DiagramContext = React.createContext(null);

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
  const { sourcePoint, setSourcePoint, messageType, setEdges } = useContext(DiagramContext);
  
  return (
    <div className="group relative" style={{ minWidth: '120px' }}>
      {/* Participant header */}
      <div className={`
        px-4 py-3 rounded-lg shadow-sm border-2 transition-all
        bg-white border-gray-200
        hover:shadow-md
      `}>
        <div className="flex items-center gap-2 justify-center">
          {data.icon && <div>{data.icon}</div>}
          <div className="text-sm font-medium text-gray-700">
            {data.label}
          </div>
        </div>
      </div>

      {/* Lifeline with dots */}
      <div className="relative">
        <div
          className="absolute left-1/2 top-full border-l-2 border-dashed border-gray-300"
          style={{
            height: '400px',
            transform: 'translateX(-50%)',
            zIndex: 1
          }}
        />
        
        {/* Connection dots */}
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="absolute w-3 h-3 rounded-full bg-white border-2 border-gray-400 
                       hover:border-blue-500 hover:bg-blue-50 cursor-pointer"
            style={{
              left: '50%',
              top: `${(index + 1) * 40}px`,
              transform: 'translateX(-50%)',
              zIndex: 2
            }}
            onClick={(e) => {
              e.stopPropagation();
              const yPos = (index + 1) * 40;
              if (!sourcePoint) {
                setSourcePoint({ nodeId: data.id, y: yPos });
              } else if (sourcePoint.nodeId !== data.id) {
                setEdges(prev => [...prev, {
                  id: `edge-${Date.now()}`,
                  source: sourcePoint.nodeId,
                  target: data.id,
                  type: messageType,
                  data: { label: 'Message' }
                }]);
                setSourcePoint(null);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Define nodeTypes outside the component
const NODE_TYPES = {
  user: BaseNode,
  system: BaseNode,
  database: BaseNode,
  service: BaseNode,
  default: BaseNode
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
          {/* Left Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">System Components</h3>
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

          {/* Middle Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Communication Types</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onMessageTypeChange('sync')}
                className={`p-3 flex flex-col items-center rounded-lg border transition-colors
                  ${messageType === 'sync' 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <SolidArrow className={`w-6 h-6 ${messageType === 'sync' ? 'text-blue-500' : 'text-gray-400'} mb-2`} />
                <span className={`text-xs text-center font-medium ${messageType === 'sync' ? 'text-blue-500' : 'text-gray-400'}`}>
                  Synchronous
                </span>
              </button>
              <button
                onClick={() => onMessageTypeChange('async')}
                className={`p-3 flex flex-col items-center rounded-lg border transition-colors
                  ${messageType === 'async' 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <AsyncArrow className={`w-6 h-6 ${messageType === 'async' ? 'text-blue-500' : 'text-gray-400'} mb-2`} />
                <span className={`text-xs text-center font-medium ${messageType === 'async' ? 'text-blue-500' : 'text-gray-400'}`}>
                  Asynchronous
                </span>
              </button>
            </div>
          </div>

          {/* Right Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Control Flow</h3>
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

// Add these custom edge types
const customEdgeTypes = {
  sync: ({ id, source, target, data }) => (
    <BaseEdge
      id={id}
      source={source}
      target={target}
      style={{ strokeWidth: 2, stroke: '#333' }}
      markerEnd={<SolidArrow />}
      label={data?.label}
    />
  ),
  async: ({ id, source, target, data }) => (
    <BaseEdge
      id={id}
      source={source}
      target={target}
      style={{ strokeWidth: 2, stroke: '#333', strokeDasharray: '5,5' }}
      markerEnd={<AsyncArrow />}
      label={data?.label}
    />
  )
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
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [pendingNodeType, setPendingNodeType] = useState(null);
  const [newNodeName, setNewNodeName] = useState('');
  const [sourcePoint, setSourcePoint] = useState(null);

  const { getNodes, getEdges, setNodes: setReactFlowNodes, setEdges: setReactFlowEdges } = useReactFlow();

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback((params) => {
    // Validate connection
    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);
    
    if (!sourceNode || !targetNode) return;
    
    // Only allow connections between lifelines
    if (!sourceNode.data.lifelineId || !targetNode.data.lifelineId) return;
    
    // Create edge with current message type
    const newEdge = {
      ...params,
      type: messageType, // Using the messageType from state
      data: {
        label: 'Message',
        type: messageType
      },
      animated: messageType === 'async'
    };
    
    setEdges((eds) => addEdge(newEdge, eds));
  }, [nodes, messageType]);

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
    setPendingNodeType(type);
    setNewNodeName(`New ${type}`);
    setShowNameDialog(true);
  }, []);

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
      }
    };

    setNodes((nds) => [...nds, newNode]);
    setShowNameDialog(false);
    setPendingNodeType(null);
    setNewNodeName('');
  }, [nodes, pendingNodeType, newNodeName]);

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
    <DiagramContext.Provider value={{
      sourcePoint,
      setSourcePoint,
      messageType,
      setEdges
    }}>
      <div style={{ width: '100%', height: '80vh' }} className="relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          nodeTypes={NODE_TYPES}
          edgeTypes={customEdgeTypes}
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
        </ReactFlow>
      </div>
    </DiagramContext.Provider>
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
