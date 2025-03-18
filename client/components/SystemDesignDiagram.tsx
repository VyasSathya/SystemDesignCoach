import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  Connection,
  NodeTypes,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Server, Database, CloudLightning, Router, Lock } from 'lucide-react';
import dynamic from 'next/dynamic';
import { mermaidToReactFlow } from './diagram/utils/systemDiagramUtils';
import SystemDesignPalette from './diagram/SystemDesignPalette';

const MermaidRenderer = dynamic(() => import('./diagram/MermaidRenderer'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-100 h-full w-full"></div>
});

// Define node types outside the component for better performance
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

interface ComponentType {
  type: string;
  label: string;
  icon: React.ReactNode;
  category: string;
}

const componentTypes: ComponentType[] = [
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

interface SystemDesignDiagramProps {
  initialMermaidCode?: string;
  onDiagramChange?: (mermaidCode: string) => void;
}

const SystemDesignDiagram: React.FC<SystemDesignDiagramProps> = ({ 
  initialMermaidCode,
  onDiagramChange 
}) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [mermaidCode, setMermaidCode] = useState<string>('');
  const [viewMode, setViewMode] = useState<'flow' | 'mermaid'>('flow');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    if (initialMermaidCode) {
      setMermaidCode(initialMermaidCode);
      // Convert initial Mermaid code to ReactFlow
      try {
        const { nodes: initialNodes, edges: initialEdges } = mermaidToReactFlow(initialMermaidCode);
        setNodes(initialNodes);
        setEdges(initialEdges);
      } catch (error) {
        console.error('Failed to parse initial Mermaid code:', error);
      }
    }
  }, [initialMermaidCode]);

  const generateMermaidCode = useCallback((nodes: Node[], edges: Edge[]): string => {
    let code = 'graph TD\n';
    
    // Add nodes
    nodes.forEach(node => {
      code += `    ${node.id}[${node.data.label}]\n`;
    });
    
    // Add edges
    edges.forEach(edge => {
      code += `    ${edge.source} --> ${edge.target}\n`;
    });
    
    return code;
  }, []);

  const updateMermaidCode = useCallback(() => {
    const newMermaidCode = generateMermaidCode(nodes, edges);
    setMermaidCode(newMermaidCode);
    if (onDiagramChange) {
      onDiagramChange(newMermaidCode);
    }
  }, [nodes, edges, generateMermaidCode, onDiagramChange]);

  useEffect(() => {
    updateMermaidCode();
  }, [nodes, edges, updateMermaidCode]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({
        ...connection,
        type: 'smoothstep',
        animated: true,
      }, eds));
    },
    []
  );

  const handleNodeAdd = useCallback((type: string, label: string) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label, type }
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    setSelectedNode(null);
  }, []);

  const handleNodeRename = useCallback((nodeId: string, newName: string) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: { ...node.data, label: newName }
        };
      }
      return node;
    }));
  }, []);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex gap-2 p-2 bg-gray-100">
        <button
          onClick={() => setViewMode('flow')}
          className={`px-3 py-1 rounded ${viewMode === 'flow' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Flow Editor
        </button>
        <button
          onClick={() => setViewMode('mermaid')}
          className={`px-3 py-1 rounded ${viewMode === 'mermaid' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Mermaid View
        </button>
      </div>
      
      <div className="flex-1 relative">
        {viewMode === 'flow' ? (
          <div className="flex h-full">
            <SystemDesignPalette
              onNodeAdd={handleNodeAdd}
              onNodeDelete={handleNodeDelete}
              onNodeRename={handleNodeRename}
              selectedNode={selectedNode}
            />
            <div className="flex-1">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                defaultEdgeOptions={{
                  type: 'smoothstep',
                  animated: true,
                }}
              >
                <Controls />
                <Background color="#f0f0f0" gap={16} />
              </ReactFlow>
            </div>
          </div>
        ) : (
          <div className="h-full">
            <MermaidRenderer 
              code={mermaidCode} 
              onError={(error) => {
                console.error('Mermaid rendering error:', error);
                // Optionally handle the error in UI
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemDesignDiagram;
