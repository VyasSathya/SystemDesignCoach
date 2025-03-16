// client/components/diagram/SequenceDiagram.js
import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls,
  addEdge,
  applyEdgeChanges, 
  applyNodeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';

const SequenceDiagram = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const nodeTypes = {
    lifeline: ({ data }) => (
      <div className="px-4 py-2 border-2 border-gray-300 rounded bg-white">
        {data.label}
      </div>
    )
  };

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

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        deleteKeyCode="Delete"
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default SequenceDiagram;
