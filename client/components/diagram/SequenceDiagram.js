// client/components/diagram/SequenceDiagram.js
import React, { useState } from 'react';
import ReactFlow, { 
  ReactFlowProvider, 
  Background, 
  Controls,
  Handle, 
  Position 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowRight, Plus, Trash2, Edit } from 'lucide-react';

// Custom Node Types for Sequence Diagrams
const ActorNode = ({ data }) => {
  return (
    <div className="sequence-actor-node">
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Top} id="top" />
      <div className="p-2 rounded-lg bg-blue-100 border border-blue-300 text-center shadow-sm">
        <div className="flex justify-center items-center mb-1">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none">
            <circle cx="12" cy="7" r="4" />
            <path d="M12 11L12 22" />
            <path d="M8 22L16 22" />
          </svg>
        </div>
        <div className="text-sm font-medium">{data.label}</div>
      </div>
    </div>
  );
};

const ObjectNode = ({ data }) => {
  return (
    <div className="sequence-object-node">
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Top} id="top" />
      <div className="p-2 rounded-lg bg-purple-100 border border-purple-300 text-center shadow-sm">
        <div className="text-sm font-medium">{data.label}</div>
      </div>
    </div>
  );
};

const LifelineNode = ({ data }) => {
  return (
    <div className="sequence-lifeline-node">
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="target" position={Position.Left} id="left" />
      <div className="w-0.5 h-full bg-gray-300 mx-auto" />
    </div>
  );
};

const MessageNode = ({ data }) => {
  return (
    <div className="sequence-message-node">
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="target" position={Position.Right} id="right" />
      <div className="flex items-center">
        <div className="text-xs bg-white px-2 py-1 rounded shadow-sm border border-gray-200">
          {data.label}
        </div>
        <ArrowRight className="text-gray-600" size={14} />
      </div>
    </div>
  );
};

// Simple diagram component without complex state management
const SequenceDiagram = ({ initialDiagram, onDiagramUpdate }) => {
  // Default initial nodes
  const defaultNodes = [
    { id: 'actor1', type: 'actor', position: { x: 100, y: 50 }, data: { label: 'User' } },
    { id: 'actor2', type: 'object', position: { x: 300, y: 50 }, data: { label: 'System' } }
  ];
  
  const defaultEdges = [
    { id: 'e1-2', source: 'actor1', target: 'actor2', type: 'default', animated: true, label: 'Request' }
  ];
  
  // Use initial values or defaults
  const [nodes, setNodes] = useState(defaultNodes);
  const [edges, setEdges] = useState(defaultEdges);
  
  // Define node types
  const nodeTypes = {
    actor: ActorNode,
    object: ObjectNode,
    lifeline: LifelineNode,
    message: MessageNode
  };
  
  // Simplified component with basic toolbar
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <button 
          onClick={() => {
            const newActor = { 
              id: `actor${nodes.length + 1}`, 
              type: 'actor', 
              position: { x: 100 + (nodes.length * 50), y: 50 }, 
              data: { label: 'New Actor' } 
            };
            setNodes([...nodes, newActor]);
          }}
          className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md shadow-sm hover:bg-blue-200"
        >
          <Plus size={16} className="mr-1" />
          Actor
        </button>
        <button 
          onClick={() => {
            const newObject = { 
              id: `object${nodes.length + 1}`, 
              type: 'object', 
              position: { x: 100 + (nodes.length * 50), y: 50 }, 
              data: { label: 'New Object' } 
            };
            setNodes([...nodes, newObject]);
          }}
          className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded-md shadow-sm hover:bg-purple-200"
        >
          <Plus size={16} className="mr-1" />
          Object
        </button>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

// Wrap with provider at the export level
const SequenceDiagramWrapped = (props) => (
  <ReactFlowProvider>
    <SequenceDiagram {...props} />
  </ReactFlowProvider>
);

export default SequenceDiagramWrapped;