import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';

const SystemSequenceDiagram = ({ 
  initialDiagram,
  onDiagramUpdate 
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (initialDiagram?.nodes && initialDiagram?.edges) {
      setNodes(initialDiagram.nodes);
      setEdges(initialDiagram.edges);
    }
  }, [initialDiagram]);

  const onConnect = useCallback((params) => {
    const newEdge = {
      ...params,
      type: 'message',
      animated: false,
      data: { 
        label: 'Request',
        type: 'sync'
      }
    };
    setEdges((eds) => [...eds, newEdge]);
  }, [setEdges]);

  // Update parent component when diagram changes
  useEffect(() => {
    if (onDiagramUpdate) {
      onDiagramUpdate({
        nodes,
        edges,
        mermaidCode: generateMermaidCode(nodes, edges)
      });
    }
  }, [nodes, edges, onDiagramUpdate]);

  const generateMermaidCode = (nodes, edges) => {
    const participants = nodes
      .filter(node => node.type === 'lifeline')
      .map(node => `participant ${node.id} as ${node.data.label}`)
      .join('\n');

    const messages = edges
      .map(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        if (!sourceNode || !targetNode) return null;
        
        return `${sourceNode.id}->${targetNode.id}: ${edge.data?.label || 'message'}`;
      })
      .filter(Boolean)
      .join('\n');

    return `sequenceDiagram\n${participants}\n${messages}`;
  };

  const nodeTypes = {
    lifeline: ({ data }) => (
      <div className="px-4 py-2 border-2 border-gray-300 rounded bg-white">
        {data.label}
      </div>
    )
  };

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-right" className="bg-white p-2 rounded shadow">
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
            onClick={() => {
              const newNode = {
                id: `lifeline-${Date.now()}`,
                type: 'lifeline',
                position: { x: 100, y: 100 },
                data: { label: 'New Participant' }
              };
              setNodes(nds => [...nds, newNode]);
            }}
          >
            Add Participant
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default SystemSequenceDiagram;