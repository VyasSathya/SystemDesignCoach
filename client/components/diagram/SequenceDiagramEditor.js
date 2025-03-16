import React, { useCallback, useState } from 'react';
import ReactFlow, { useReactFlow } from 'reactflow';
import { sequenceDiagramNodeTypes } from './NodeTypes/SequenceDiagramNodeTypes';
import { createParticipantNode, createEdge } from './utils/nodeCreation';

export const SequenceDiagramEditor = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const { getViewport, project } = useReactFlow();

  const handleAddNode = useCallback((type) => {
    // Get center of current viewport
    const viewport = getViewport();
    const centerX = viewport.width / 2;
    const centerY = viewport.height / 2;
    
    // Convert to flow coordinates
    const position = project({ x: centerX, y: centerY });
    
    // Create node at center
    const newNode = createParticipantNode(type, position);
    
    setNodes((nds) => [...nds, newNode]);
    
    const name = prompt(`Enter name for ${type}:`);
    if (name) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === newNode.id
            ? { ...node, data: { ...node.data, label: name } }
            : node
        )
      );
    }
  }, [project, getViewport]);

  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(createEdge(params.source, params.target), eds));
  }, []);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={sequenceDiagramNodeTypes}
        fitView
      >
        {/* Add your toolbar/controls here */}
      </ReactFlow>
    </div>
  );
};