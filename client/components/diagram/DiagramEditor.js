import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

const DiagramEditor = ({ 
  initialNodes, 
  initialEdges, 
  onNodesChange: onNodesChangeCallback,
  onEdgesChange: onEdgesChangeCallback,
  diagramType = 'system'
}) => {
  const [nodes, setNodes] = useState(initialNodes || []);
  const [edges, setEdges] = useState(initialEdges || []);

  useEffect(() => {
    if (initialNodes) setNodes(initialNodes);
    if (initialEdges) setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => {
      const updatedNodes = applyNodeChanges(changes, nds);
      onNodesChangeCallback?.(updatedNodes);
      return updatedNodes;
    });
  }, [onNodesChangeCallback]);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => {
      const updatedEdges = applyEdgeChanges(changes, eds);
      onEdgesChangeCallback?.(updatedEdges);
      return updatedEdges;
    });
  }, [onEdgesChangeCallback]);

  const onConnect = useCallback((params) => {
    const newEdge = {
      ...params,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      type: 'default' // Can be overridden based on diagram type
    };

    setEdges((eds) => {
      const updatedEdges = addEdge(newEdge, eds);
      onEdgesChangeCallback?.(updatedEdges);
      return updatedEdges;
    });
  }, [onEdgesChangeCallback]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
        }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

// Wrap with ReactFlowProvider and handle state persistence
const DiagramEditorWrapper = (props) => (
  <ReactFlowProvider>
    <DiagramEditor {...props} />
  </ReactFlowProvider>
);

export default DiagramEditorWrapper;