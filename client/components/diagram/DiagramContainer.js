import React, { useState, useCallback, useEffect } from 'react';
import DiagramEditor from './DiagramEditor';
import { diagramDataProcessor } from '../../services/diagram';

const DiagramContainer = ({ 
  initialDiagramData,
  onDiagramChange,
  diagramType = 'system'
}) => {
  const [diagramState, setDiagramState] = useState({
    nodes: initialDiagramData?.nodes || [],
    edges: initialDiagramData?.edges || []
  });

  // Handle nodes change
  const handleNodesChange = useCallback((updatedNodes) => {
    setDiagramState(prev => ({
      ...prev,
      nodes: updatedNodes
    }));
    
    onDiagramChange?.({
      nodes: updatedNodes,
      edges: diagramState.edges
    });
  }, [diagramState.edges, onDiagramChange]);

  // Handle edges change
  const handleEdgesChange = useCallback((updatedEdges) => {
    setDiagramState(prev => ({
      ...prev,
      edges: updatedEdges
    }));
    
    onDiagramChange?.({
      nodes: diagramState.nodes,
      edges: updatedEdges
    });
  }, [diagramState.nodes, onDiagramChange]);

  // Update state when initial data changes
  useEffect(() => {
    if (initialDiagramData) {
      setDiagramState({
        nodes: initialDiagramData.nodes || [],
        edges: initialDiagramData.edges || []
      });
    }
  }, [initialDiagramData]);

  return (
    <div className="w-full h-full">
      <DiagramEditor
        initialNodes={diagramState.nodes}
        initialEdges={diagramState.edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        diagramType={diagramType}
      />
    </div>
  );
};

export default DiagramContainer;