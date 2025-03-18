import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  Connection,
  NodeTypes,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import SystemDesignPalette from './diagram/SystemDesignPalette';

const SystemDesignDiagram = ({ sessionId, onChange }) => {
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
    <div className="flex h-[calc(100vh-160px)]"> {/* Adjust height to account for header and footer */}
      <SystemDesignPalette
        onNodeAdd={handleNodeAdd}
        onNodeDelete={handleNodeDelete}
        onNodeRename={handleNodeRename}
        selectedNode={selectedNode}
      />
      <div className="flex-1 relative">
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
  );
};

export default SystemDesignDiagram;
