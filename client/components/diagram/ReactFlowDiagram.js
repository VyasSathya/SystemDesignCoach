// client/components/diagram/ReactFlowDiagram.js
import React, { useState, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  Panel,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
} from 'reactflow';
import { Globe, Server, Database, Archive, Grid, Share2, Box } from 'lucide-react';
import 'reactflow/dist/style.css';

// Custom node component
const CustomNode = ({ data }) => {
  const NodeIcon = data.icon;
  
  return (
    <div className="group relative">
      <div className={`
        px-4 py-3
        shadow-lg
        rounded-lg
        bg-${data.bgColor}
        border-2 border-${data.color}
        min-w-[160px]
      `}>
        <div className="flex items-center gap-3">
          <div className={`
            p-2
            rounded-lg
            bg-${data.color}/10
          `}>
            <NodeIcon className={`w-6 h-6 text-${data.color}`} />
          </div>
          
          <div>
            <div className={`text-xs font-medium text-${data.color} mb-1`}>
              {data.type.toUpperCase()}
            </div>
            <div className="text-sm font-bold text-gray-800">
              {data.label}
            </div>
            {data.notes && (
              <div className="text-xs text-gray-500 mt-1">
                {data.notes}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Define nodeTypes with our custom node
const nodeTypes = {
  custom: CustomNode,
};

const getNodeConfig = (type) => {
  const configs = {
    client: {
      icon: Globe,
      color: 'blue-500',
      bgColor: 'blue-50',
      label: 'Client'
    },
    service: {
      icon: Server,
      color: 'green-500',
      bgColor: 'green-50',
      label: 'Service'
    },
    database: {
      icon: Database,
      color: 'purple-500',
      bgColor: 'purple-50',
      label: 'Database'
    },
    cache: {
      icon: Archive,
      color: 'amber-500',
      bgColor: 'amber-50',
      label: 'Cache'
    },
    loadBalancer: {
      icon: Share2,
      color: 'pink-500',
      bgColor: 'pink-50',
      label: 'Load Balancer'
    },
    queue: {
      icon: Box,
      color: 'indigo-500',
      bgColor: 'indigo-50',
      label: 'Queue'
    }
  };
  return configs[type];
};

const ReactFlowDiagram = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const { project, getViewport } = useReactFlow();

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

  const addNode = (type) => {
    const name = prompt(`Enter name for ${type}:`);
    if (!name) return;

    const nodeConfig = getNodeConfig(type);
    
    // Get the viewport's dimensions and center position
    const viewport = getViewport();
    const centerX = (viewport.width || 800) / 2;
    const centerY = (viewport.height || 600) / 2;
    
    // Convert the center position to React Flow coordinates
    const position = project({
      x: centerX,
      y: centerY
    });

    const newNode = {
      id: `${type}-${Date.now()}`,
      type: 'custom',
      position,
      data: {
        label: name,
        type: type,
        ...nodeConfig,
      }
    };

    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { stroke: '#999', strokeWidth: 2 }
          }}
          fitView
        >
          <Background />
          <Controls />
          <Panel position="top-left" className="flex flex-col gap-2">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => addNode('client')}
            >
              Add Client
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => addNode('service')}
            >
              Add Service
            </button>
            <button
              className="bg-purple-500 text-white px-4 py-2 rounded"
              onClick={() => addNode('database')}
            >
              Add Database
            </button>
            <button
              className="bg-amber-500 text-white px-4 py-2 rounded"
              onClick={() => addNode('cache')}
            >
              Add Cache
            </button>
            <button
              className="bg-pink-500 text-white px-4 py-2 rounded"
              onClick={() => addNode('loadBalancer')}
            >
              Add Load Balancer
            </button>
            <button
              className="bg-indigo-500 text-white px-4 py-2 rounded"
              onClick={() => addNode('queue')}
            >
              Add Queue
            </button>
          </Panel>
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default ReactFlowDiagramWithProvider;