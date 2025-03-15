// client/components/diagram/ReactFlowDiagram.js
import React, { useState, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  Panel
} from 'reactflow';
import { Globe, Server, Database, Archive, Grid, Share2, Box } from 'lucide-react';
import 'reactflow/dist/style.css';

// Import custom node types
import DatabaseNode from './NodeTypes/DatabaseNode';
import ServiceNode from './NodeTypes/ServiceNode';
import ClientNode from './NodeTypes/ClientNode';
import LoadBalancerNode from './NodeTypes/LoadBalancerNode';
import CacheNode from './NodeTypes/CacheNode';
import QueueNode from './NodeTypes/QueueNode';
import CustomNode from './NodeTypes/CustomNode';
import GatewayNode from './NodeTypes/GatewayNode';

// Define nodeTypes outside the component to prevent re-creation on each render
const nodeTypes = {
  database: DatabaseNode,
  service: ServiceNode,
  client: ClientNode,
  loadBalancer: LoadBalancerNode,
  cache: CacheNode,
  queue: QueueNode,
  custom: CustomNode,
  gateway: GatewayNode
};

const Flow = ({ 
  initialNodes, 
  initialEdges, 
  onNodesChange, 
  onEdgesChange, 
  onConnect,
  onDiagramUpdate 
}) => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [autoLayout, setAutoLayout] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodeEditor, setShowNodeEditor] = useState(false);
  const [nodeName, setNodeName] = useState('');
  const [nodeNotes, setNodeNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedElements, setSelectedElements] = useState([]);
  
  // Safely get nodes and edges with defaults
  const safeNodes = Array.isArray(initialNodes) && initialNodes.length > 0 
    ? initialNodes 
    : [{ id: 'default', position: { x: 100, y: 100 }, data: { label: 'Default Node' } }];
  
  const safeEdges = Array.isArray(initialEdges) ? initialEdges : [];

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setNodeName(node.data.label || '');
    setNodeNotes(node.data.notes || '');
    setShowNodeEditor(true);
  }, []);

  const onNodeDoubleClick = useCallback((event, node) => {
    setSelectedNode(node);
    setNodeName(node.data.label || '');
    setNodeNotes(node.data.notes || '');
    setShowNodeEditor(true);
  }, []);

  const handleSaveNodeEdit = useCallback(() => {
    if (!selectedNode) return;
    
    const updatedNodes = safeNodes.map(n => {
      if (n.id === selectedNode.id) {
        return {
          ...n,
          data: {
            ...n.data,
            label: nodeName,
            notes: nodeNotes
          }
        };
      }
      return n;
    });
    
    onNodesChange([{ type: 'reset', items: updatedNodes }]);
    setShowNodeEditor(false);
    setSelectedNode(null);
    
    if (onDiagramUpdate) {
      onDiagramUpdate({
        nodes: updatedNodes,
        edges: safeEdges
      });
    }
  }, [selectedNode, nodeName, nodeNotes, safeNodes, safeEdges, onNodesChange, onDiagramUpdate]);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `${type}_${Date.now()}`,
        type,
        position,
        data: { 
          label: '',  // Empty label initially
          notes: '',
          type: type  // Store the type separately
        },
      };

      // Show the label editor immediately
      setSelectedNode(newNode);
      setNodeName('');
      setNodeNotes('');
      setShowNodeEditor(true);

      // Add node to diagram
      onNodesChange([{ type: 'add', item: newNode }]);
    },
    [reactFlowInstance]
  );

  const handleConnect = useCallback((params) => {
    const newEdge = {
      ...params,
      id: `edge-${params.source}-${params.target}`,
      type: 'smoothstep',
      data: { label: '' }
    };
    
    const updatedEdges = addEdge(newEdge, safeEdges);
    onConnect(params);
    
    if (onDiagramUpdate) {
      onDiagramUpdate({
        nodes: safeNodes,
        edges: updatedEdges
      });
    }
  }, [safeNodes, safeEdges, onConnect, onDiagramUpdate]);

  const handleAddNode = useCallback((type) => {
    const name = prompt("Enter a name for this node:");
    if (!name) return;

    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 100, y: 100 },
      data: { label: name }
    };
    
    onNodesChange([{ type: 'add', item: newNode }]);
  }, [onNodesChange]);

  const handleDelete = useCallback(() => {
    selectedElements.forEach(element => {
      onNodesChange([{ type: 'remove', id: element.id }]);
    });
  }, [selectedElements, onNodesChange]);

  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper} style={{ minHeight: '300px' }}>
      <ReactFlow
        nodes={safeNodes}
        edges={safeEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView={false}
        attributionPosition="bottom-left"
        minZoom={0.5}
        maxZoom={2}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Control', 'Meta']}
        snapToGrid={autoLayout}
        snapGrid={[15, 15]}
        connectionLineStyle={{ strokeWidth: 2, stroke: '#999' }}
        connectionLineType="smoothstep"
        onSelectionChange={(elements) => setSelectedElements(elements)}
      >
        <Controls />
        <Background variant="dots" gap={12} size={1} />
        <Panel position="top-right">
          <div className="bg-white p-2 rounded shadow-md flex flex-col space-y-2">
            <button 
              onClick={() => setAutoLayout(!autoLayout)} 
              className={`px-2 py-1 text-xs rounded ${autoLayout ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {autoLayout ? 'Disable Auto Layout' : 'Enable Auto Layout'}
            </button>
            <button 
              onClick={() => {
                if (reactFlowInstance) {
                  reactFlowInstance.fitView();
                }
              }}
              className="px-2 py-1 text-xs bg-gray-200 rounded"
            >
              Center View
            </button>
          </div>
        </Panel>
        <Panel position="bottom" className="w-full">
          <div className="bg-white p-2 border-t border-gray-200 flex flex-wrap justify-center gap-2">
            {[
              { type: 'client', icon: <Globe className="w-4 h-4" />, color: 'blue', label: 'Client' },
              { type: 'service', icon: <Server className="w-4 h-4" />, color: 'green', label: 'Service' },
              { type: 'database', icon: <Database className="w-4 h-4" />, color: 'purple', label: 'Database' },
              { type: 'cache', icon: <Archive className="w-4 h-4" />, color: 'red', label: 'Cache' },
              { type: 'loadBalancer', icon: <Grid className="w-4 h-4" />, color: 'orange', label: 'Load Balancer' },
              { type: 'queue', icon: <Share2 className="w-4 h-4" />, color: 'indigo', label: 'Queue' },
              { type: 'custom', icon: <Box className="w-4 h-4" />, color: 'gray', label: 'Custom' }
            ].map(({ type, icon, color, label }) => (
              <button
                key={type}
                onClick={() => handleAddNode(type)}
                className="flex items-center px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData('application/reactflow', type);
                  setIsDragging(true);
                }}
                onDragEnd={() => setIsDragging(false)}
              >
                <span className="mr-1">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </Panel>
      </ReactFlow>
      
      {showNodeEditor && selectedNode && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg p-4 w-64">
            <h3 className="font-medium mb-2">Edit Node</h3>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">Name</label>
              <input 
                type="text" 
                value={nodeName} 
                onChange={(e) => setNodeName(e.target.value)}
                className="w-full px-2 py-1 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">Notes</label>
              <textarea 
                value={nodeNotes} 
                onChange={(e) => setNodeNotes(e.target.value)}
                className="w-full px-2 py-1 border rounded h-20"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowNodeEditor(false)}
                className="px-3 py-1 text-sm bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveNodeEdit}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper with error handling
const ReactFlowDiagramWithProvider = (props) => {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
};

export default ReactFlowDiagramWithProvider;