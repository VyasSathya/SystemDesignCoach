import React, { useRef, useState, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';

// Import custom node types
import DatabaseNode from './NodeTypes/DatabaseNode';
import ServiceNode from './NodeTypes/ServiceNode';
import ClientNode from './NodeTypes/ClientNode';
import LoadBalancerNode from './NodeTypes/LoadBalancerNode';
import CacheNode from './NodeTypes/CacheNode';
import QueueNode from './NodeTypes/QueueNode';

// Define node types
const nodeTypes = {
  database: DatabaseNode,
  service: ServiceNode,
  client: ClientNode,
  loadBalancer: LoadBalancerNode,
  cache: CacheNode,
  queue: QueueNode
};

// The main component needs to be defined inside the provider to access React Flow hooks
const FlowWithProvider = ({ initialNodes, initialEdges, onNodesChange, onEdgesChange, onConnect }) => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Handle node dragging
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle node dropping from palette
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      
      // Check if the dropped element is valid
      if (!type) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      const newNode = {
        id: `${type}_${Date.now()}`,
        type,
        position,
        data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)}` },
      };

      onNodesChange([{ type: 'add', item: newNode }]);
    },
    [reactFlowInstance, onNodesChange]
  );

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.5}
        maxZoom={2}
        defaultZoom={1}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Control', 'Meta']}
        snapToGrid={true}
        snapGrid={[15, 15]}
        connectionLineStyle={{ strokeWidth: 2, stroke: '#999' }}
        connectionLineType="smoothstep"
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

// Separate wrapper that doesn't rely on the React Flow context
const ReactFlowDiagramWithProvider = ({ 
  initialNodes, 
  initialEdges, 
  onNodesChange, 
  onEdgesChange, 
  onConnect 
}) => {
  return (
    <ReactFlowProvider>
      <FlowWithProvider
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      />
    </ReactFlowProvider>
  );
};

export default ReactFlowDiagramWithProvider;