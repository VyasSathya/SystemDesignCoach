// client/components/diagram/ReactFlowDiagram.js
import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  addEdge,
  Panel
} from 'reactflow';
import { Database, Server, Globe, Archive, Grid, Share2, Box } from 'lucide-react';
import 'reactflow/dist/style.css';

// Import custom node types
import DatabaseNode from './NodeTypes/DatabaseNode';
import ServiceNode from './NodeTypes/ServiceNode';
import ClientNode from './NodeTypes/ClientNode';
import LoadBalancerNode from './NodeTypes/LoadBalancerNode';
import CacheNode from './NodeTypes/CacheNode';
import QueueNode from './NodeTypes/QueueNode';
import CustomNode from './NodeTypes/CustomNode';

// Define node types
const nodeTypes = {
  database: DatabaseNode,
  service: ServiceNode,
  client: ClientNode,
  loadBalancer: LoadBalancerNode,
  cache: CacheNode,
  queue: QueueNode,
  custom: CustomNode
};

// The implementation component that uses ReactFlow hooks
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
  
  // On initialization, generate mermaid representation
  useEffect(() => {
    if (initialNodes?.length > 0 && onDiagramUpdate) {
      onDiagramUpdate({
        nodes: initialNodes,
        edges: initialEdges,
        mermaidCode: ''  // We'll generate this in the parent component
      });
    }
  }, []);

  // Handle node dragging
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle node click for editing (single click)
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setNodeName(node.data.label || '');
    setNodeNotes(node.data.notes || '');
    setShowNodeEditor(true);
  }, []);

  // Double click handler - alternative way to edit nodes
  const onNodeDoubleClick = useCallback((event, node) => {
    setSelectedNode(node);
    setNodeName(node.data.label || '');
    setNodeNotes(node.data.notes || '');
    setShowNodeEditor(true);
  }, []);

  // Save node edits
  const handleSaveNodeEdit = useCallback(() => {
    if (!selectedNode) return;
    
    // Create a deep copy of all nodes and apply the direct change
    const updatedNodes = initialNodes.map(n => {
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
    
    // Replace the entire nodes state
    onNodesChange([{
      type: 'reset',
      items: updatedNodes
    }]);
    
    setShowNodeEditor(false);
    setSelectedNode(null);
    
    // Notify parent of diagram update with the new nodes
    onDiagramUpdate?.({
      nodes: updatedNodes,
      edges: initialEdges
    });
  }, [selectedNode, nodeName, nodeNotes, initialNodes, initialEdges, onNodesChange, onDiagramUpdate]);

  // Handle node dropping from palette
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!reactFlowInstance || !reactFlowWrapper.current) {
        console.log("Can't handle drop - missing instance or wrapper");
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // Check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        console.log("Invalid drag data:", type);
        return;
      }

      // Calculate exact drop position
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Generate default label based on type
      const defaultLabel = type.charAt(0).toUpperCase() + type.slice(1);
      const nodeId = `${type}_${Date.now()}`;
      
      const newNode = {
        id: nodeId,
        type,
        position,
        data: { 
          label: `${defaultLabel}`,
          notes: ''
        },
      };

      // Create a new nodes array with the added node - IMPORTANT for position stability
      const updatedNodes = [...initialNodes, newNode];
      
      // Send a single "add" change operation instead of replacing all nodes
      onNodesChange([{ type: 'add', item: newNode }]);
      
      // Notify parent of diagram update
      onDiagramUpdate?.({
        nodes: updatedNodes,
        edges: initialEdges
      });
    },
    [reactFlowInstance, initialNodes, initialEdges, onNodesChange, onDiagramUpdate]
  );

  // Custom connect handler
  const handleConnect = useCallback((params) => {
    const newEdge = {
      ...params,
      id: `edge-${params.source}-${params.target}`,
      type: 'smoothstep',
      data: { label: '' }
    };
    
    // Create a new edges array with the added edge
    const updatedEdges = addEdge(newEdge, initialEdges);
    onConnect(params);
    
    // Notify parent of diagram update
    onDiagramUpdate?.({
      nodes: initialNodes,
      edges: updatedEdges
    });
  }, [initialNodes, initialEdges, onConnect, onDiagramUpdate]);

  // Add a node programmatically (directly from buttons, not drag & drop)
  const addNode = useCallback((type) => {
    // Generate a random position that's visible in the viewport
    const position = reactFlowInstance ? 
      { 
        x: Math.random() * 300 + 50, 
        y: Math.random() * 300 + 50 
      } : 
      { x: 100, y: 100 };
    
    // Generate default name based on type
    const defaultLabel = type.charAt(0).toUpperCase() + type.slice(1);
    const nodeId = `${type}_${Date.now()}`;
    
    const newNode = {
      id: nodeId,
      type,
      position,
      data: { 
        label: `${defaultLabel}`,
        notes: ''
      },
    };
    
    // Add the new node
    const updatedNodes = [...initialNodes, newNode];
    onNodesChange([{ type: 'add', item: newNode }]);
    
    // Notify parent of diagram update
    onDiagramUpdate?.({
      nodes: updatedNodes,
      edges: initialEdges
    });
  }, [reactFlowInstance, initialNodes, initialEdges, onNodesChange, onDiagramUpdate]);

  // Fallback for empty nodes array
  const safeNodes = Array.isArray(initialNodes) && initialNodes.length > 0 
    ? initialNodes 
    : [{ id: 'default', position: { x: 100, y: 100 }, data: { label: 'Default Node' } }];

  // Fallback for empty edges array
  const safeEdges = Array.isArray(initialEdges) ? initialEdges : [];

  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper} style={{minHeight: '300px'}}>
      <ReactFlow
        nodes={safeNodes}
        edges={safeEdges}
        onNodesChange={(changes) => {
          // Process each change individually
          onNodesChange(changes);
          
          // After a short delay to let React state update, notify parent of diagram update
          // This fixes issues with position changes not being reflected
          setTimeout(() => {
            onDiagramUpdate?.({
              nodes: initialNodes,
              edges: initialEdges
            });
          }, 50);
        }}
        onEdgesChange={(changes) => {
          onEdgesChange(changes);
          
          // After a short delay to let React state update
          setTimeout(() => {
            onDiagramUpdate?.({
              nodes: initialNodes,
              edges: initialEdges
            });
          }, 50);
        }}
        onConnect={handleConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView={false} // Disable auto-fit to maintain positions
        attributionPosition="bottom-left"
        minZoom={0.5}
        maxZoom={2}
        defaultZoom={1}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Control', 'Meta']}
        snapToGrid={autoLayout} // Only snap to grid when auto layout is enabled
        snapGrid={[15, 15]}
        connectionLineStyle={{ strokeWidth: 2, stroke: '#999' }}
        connectionLineType="smoothstep"
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
        
        {/* Layout controls */}
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
        
        {/* Component palette for quick adding without drag & drop */}
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
                onClick={() => addNode(type)}
                className={`flex items-center px-2 py-1 text-xs rounded bg-${color}-100 text-${color}-700 border border-${color}-200 hover:bg-${color}-200`}
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
      
      {/* Node Editor Modal */}
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
  try {
    return (
      <ReactFlowProvider>
        <Flow {...props} />
      </ReactFlowProvider>
    );
  } catch (err) {
    console.error('ReactFlow initialization error:', err);
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 text-gray-500 text-sm">
        <p>Could not initialize diagram editor. Please switch to code view.</p>
        <p className="text-red-500">{err.message}</p>
      </div>
    );
  }
};

export default ReactFlowDiagramWithProvider;