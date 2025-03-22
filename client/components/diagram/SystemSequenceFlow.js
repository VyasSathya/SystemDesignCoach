import React from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 100, y: 100 }, data: { label: 'Node 1' } }
];

const initialEdges = [];

function SystemSequenceFlow() {
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

export default SystemSequenceFlow;

