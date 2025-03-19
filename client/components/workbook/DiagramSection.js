import React, { useCallback } from 'react';
import DiagramContainer from '../diagram/DiagramContainer';

const DiagramSection = ({ 
  diagramData, 
  onDiagramUpdate,
  diagramType 
}) => {
  const handleDiagramChange = useCallback((newDiagramState) => {
    onDiagramUpdate?.(newDiagramState);
  }, [onDiagramUpdate]);

  return (
    <div className="h-full">
      <DiagramContainer
        initialDiagramData={diagramData}
        onDiagramChange={handleDiagramChange}
        diagramType={diagramType}
      />
    </div>
  );
};

export default DiagramSection;