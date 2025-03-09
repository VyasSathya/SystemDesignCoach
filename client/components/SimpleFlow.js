import React from 'react';
import ReactFlow, { ReactFlowProvider, Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 100, y: 100 }, data: { label: 'Hello' } },
  { id: '2', position: { x: 200, y: 200 }, data: { label: 'World' } }
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' }
];

function Flow() {
  // Debug logging
  console.log("SimpleFlow rendering with:", initialNodes, initialEdges);
  
  return (
    <div style={{width: '100%', height: '100%', position: 'relative'}}>
      <ReactFlow 
        nodes={initialNodes}
        edges={initialEdges}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

export default function SimpleFlowWithProvider() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}