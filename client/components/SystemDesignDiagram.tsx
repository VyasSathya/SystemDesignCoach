import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  Connection,
  NodeTypes,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange
} from 'reactflow';
import 'reactflow/dist/style.css';
import mermaid from 'mermaid';
import { Server, Database, CloudLightning, Router, Lock } from 'lucide-react';

// Custom Node Types with Detailed Rendering
const nodeTypes: NodeTypes = {
  infrastructureNode: ({ data }) => (
    <div className="bg-blue-100 p-2 rounded border border-blue-300 flex items-center">
      {data.icon}
      <span className="ml-2">{data.label}</span>
    </div>
  ),
  computationNode: ({ data }) => (
    <div className="bg-green-100 p-2 rounded border border-green-300 flex items-center">
      {data.icon}
      <span className="ml-2">{data.label}</span>
    </div>
  ),
  dataNode: ({ data }) => (
    <div className="bg-purple-100 p-2 rounded border border-purple-300 flex items-center">
      {data.icon}
      <span className="ml-2">{data.label}</span>
    </div>
  ),
};

// Sidebar Component for Adding System Design Components
const SystemDesignSidebar: React.FC<{ onAddNode: (type: string, label: string) => void }> = ({ onAddNode }) => {
  const componentTypes = [
    { 
      type: 'infrastructureNode', 
      label: 'Load Balancer', 
      icon: <Router className="h-5 w-5 text-blue-600" />,
      category: 'Infrastructure'
    },
    { 
      type: 'computationNode', 
      label: 'Web Server', 
      icon: <Server className="h-5 w-5 text-green-600" />,
      category: 'Computation'
    },
    { 
      type: 'dataNode', 
      label: 'Database', 
      icon: <Database className="h-5 w-5 text-purple-600" />,
      category: 'Data'
    },
    { 
      type: 'infrastructureNode', 
      label: 'API Gateway', 
      icon: <CloudLightning className="h-5 w-5 text-blue-600" />,
      category: 'Infrastructure'
    },
    { 
      type: 'infrastructureNode', 
      label: 'Authentication', 
      icon: <Lock className="h-5 w-5 text-blue-600" />,
      category: 'Infrastructure'
    }
  ];

  return (
    <div className="w-64 p-4 bg-gray-50 border-r">
      <h2 className="text-lg font-bold mb-4">Components</h2>
      {componentTypes.map((component, index) => (
        <button
          key={index}
          onClick={() => onAddNode(component.type, component.label)}
          className="flex items-center w-full p-2 hover:bg-gray-100 rounded mb-2"
        >
          {component.icon}
          <span className="ml-2 text-sm">{component.label}</span>
          <span className="ml-auto text-xs text-gray-500">{component.category}</span>
        </button>
      ))}
    </div>
  );
};

const SystemDesignDiagram: React.FC = () => {
  // State management for nodes and edges using regular useState
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Handler for node changes
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes(nds => applyNodeChanges(changes, nds));
    },
    []
  );

  // Handler for edge changes
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges(eds => applyEdgeChanges(changes, eds));
    },
    []
  );

  // Handle connections between nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = { 
        ...connection, 
        id: `edge-${connection.source}-${connection.target}`,
        type: 'default',
        animated: true 
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    []
  );

  // Add a new node to the diagram
  const handleAddNode = useCallback((type: string, label: string) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type,
      data: { 
        label, 
        icon: type === 'infrastructureNode' ? <Router className="h-5 w-5 text-blue-600" /> :
               type === 'computationNode' ? <Server className="h-5 w-5 text-green-600" /> :
               <Database className="h-5 w-5 text-purple-600" />
      },
      position: { 
        x: Math.random() * 500, 
        y: Math.random() * 500 
      },
    };

    setNodes((prevNodes) => [...prevNodes, newNode]);
  }, []);

  // Generate Mermaid code for the current diagram
  const generateMermaidCode = useCallback(() => {
    const nodeLines = nodes.map(
      (node) => `${node.id}[${node.data.label}]`
    );
    const edgeLines = edges.map(
      (edge) => `${edge.source} --> ${edge.target}`
    );

    return `graph TD\n${[...nodeLines, ...edgeLines].join('\n')}`;
  }, [nodes, edges]);

  // Render Mermaid diagram
  const renderMermaidDiagram = useCallback(async () => {
    try {
      mermaid.initialize({ 
        startOnLoad: false,
        theme: 'default'
      });

      const { svg } = await mermaid.render('mermaid-diagram', generateMermaidCode());
      return svg;
    } catch (error) {
      console.error('Mermaid rendering error', error);
      return '';
    }
  }, [generateMermaidCode]);

  // Render the system design diagram
  return (
    <div className="flex h-screen">
      <SystemDesignSidebar onAddNode={handleAddNode} />
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <Background color="#f0f0f0" />
        </ReactFlow>
      </div>
    </div>
  );
};

export default SystemDesignDiagram;