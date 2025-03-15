import React, { useCallback, useState, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges
} from 'reactflow';
import { Trash2 } from 'lucide-react';
import NodePalette from './NodePalette';
import { NODE_TYPES, getNodeConfig } from './utils/nodePresets';
import CustomNode from './NodeTypes/CustomNode';
import 'reactflow/dist/style.css';

// Define nodeTypes outside of the component
const nodeTypes = {
  // Client/User nodes
  user: CustomNode,
  webapp: CustomNode,
  mobile: CustomNode,
  iot: CustomNode,

  // Networking & Delivery nodes
  loadbalancer: CustomNode,
  cdn: CustomNode,
  gateway: CustomNode,
  proxy: CustomNode,

  // Backend Services nodes
  service: CustomNode,
  serverless: CustomNode,
  queue: CustomNode,
  container: CustomNode,

  // Database & Storage nodes
  database: CustomNode,
  storage: CustomNode,
  cache: CustomNode,
  file: CustomNode,

  // Security & External nodes
  auth: CustomNode,
  firewall: CustomNode,
  security: CustomNode,
  external: CustomNode
};

function SystemArchitectureDiagram({ initialNodes, initialEdges, onNodesChange, onEdgesChange, onConnect }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedElements, setSelectedElements] = useState([]);

  const handleAddNode = useCallback((type) => {
    const position = { x: Math.random() * 500, y: Math.random() * 300 };
    const nodeConfig = getNodeConfig(type);
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: { 
        label: nodeConfig.label || type,
        type 
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  const handleDelete = useCallback(() => {
    if (selectedElements.length > 0) {
      setNodes((nds) => nds.filter((node) => !selectedElements.includes(node)));
      setEdges((eds) => eds.filter((edge) => !selectedElements.includes(edge)));
    }
  }, [selectedElements]);

  return (
    <div className="h-full w-full relative">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onSelectionChange={setSelectedElements}
          deleteKeyCode={['Backspace', 'Delete']}
          fitView
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true
          }}
        >
          <Background />
          <Controls />
          <MiniMap />
          <Panel position="top-right" className="bg-white p-2 rounded-lg shadow-lg m-2">
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
              disabled={selectedElements.length === 0}
            >
              <Trash2 size={20} />
            </button>
          </Panel>
        </ReactFlow>
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <NodePalette onNodeAdd={handleAddNode} />
        </div>
      </ReactFlowProvider>
    </div>
  );
}

export default SystemArchitectureDiagram;
