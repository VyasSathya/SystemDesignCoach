// client/components/diagram/SequenceDiagramManager.js
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ReactFlowProvider } from 'reactflow';
import SequenceDiagram from './SequenceDiagram';

/**
 * SequenceDiagramManager - Component that handles state and coordinates
 * between participants and lifelines in a sequence diagram.
 * 
 * This component addresses the problem of lifelines moving up and down
 * by ensuring they always remain fixed relative to their participants.
 */
const SequenceDiagramManager = ({ initialDiagram, onDiagramUpdate }) => {
  // Store the actual node positions for lifelines
  const [participants, setParticipants] = useState([]);
  const [diagramState, setDiagramState] = useState(initialDiagram || { nodes: [], edges: [], mermaidCode: '' });
  
  // Reference to the current diagram for callbacks
  const diagramRef = useRef(diagramState);
  useEffect(() => {
    diagramRef.current = diagramState;
  }, [diagramState]);
  
  // Extract participants from diagram nodes on initialization
  useEffect(() => {
    if (initialDiagram?.nodes) {
      const extractedParticipants = initialDiagram.nodes.filter(
        node => node.type === 'actor' || node.type === 'participant'
      );
      setParticipants(extractedParticipants);
    }
  }, [initialDiagram]);
  
  // Handle node position changes, particularly for participants
  const handleNodePositionChange = useCallback((node, newPosition) => {
    // If a participant is moved, update its stored position
    if (node.type === 'actor' || node.type === 'participant') {
      const updatedParticipants = participants.map(p => 
        p.id === node.id 
          ? { ...p, position: newPosition }
          : p
      );
      
      // If this is a new participant, add it
      if (!updatedParticipants.some(p => p.id === node.id)) {
        updatedParticipants.push({ ...node, position: newPosition });
      }
      
      setParticipants(updatedParticipants);
    }
  }, [participants]);
  
  // When a lifeline needs to be updated because its parent moved
  const updateLifelinePosition = useCallback((lifeline, parentPosition) => {
    // Calculate new position based on parent's horizontal position
    // but maintain vertical position to keep messages aligned
    const newPosition = {
      x: parentPosition.x + 25, // Center under parent 
      y: lifeline.position.y     // Keep original vertical position
    };
    
    return newPosition;
  }, []);
  
  // Handle diagram updates
  const handleDiagramUpdate = useCallback((updatedDiagram) => {
    // Store updated diagram
    setDiagramState(updatedDiagram);
    
    // Extract participants
    const updatedParticipants = updatedDiagram.nodes.filter(
      node => node.type === 'actor' || node.type === 'participant'
    );
    setParticipants(updatedParticipants);
    
    // Pass updates to parent component if needed
    if (onDiagramUpdate) {
      onDiagramUpdate(updatedDiagram);
    }
  }, [onDiagramUpdate]);
  
  // Process the diagram to ensure lifelines maintain correct positions
  const processedDiagram = useCallback(() => {
    if (!diagramState?.nodes?.length) return diagramState;
    
    // Create a processed version of nodes with fixed lifeline positions
    const processedNodes = diagramState.nodes.map(node => {
      // If this is a lifeline, find its parent and update position
      if (node.type === 'lifeline' && node.data?.participantId) {
        const parent = participants.find(p => p.id === node.data.participantId);
        if (parent) {
          // Calculate aligned position
          const alignedPosition = {
            x: parent.position.x + 25, // Center under parent
            y: 120 // Fixed vertical offset from top
          };
          
          // Return updated node with fixed position
          return {
            ...node,
            position: alignedPosition,
            // Add parent position as data so child component knows when to update
            data: {
              ...node.data,
              parentX: parent.position.x,
              parentY: parent.position.y
            }
          };
        }
      }
      return node;
    });
    
    return {
      ...diagramState,
      nodes: processedNodes
    };
  }, [diagramState, participants]);
  
  return (
    <ReactFlowProvider>
      <SequenceDiagram
        initialDiagram={processedDiagram()}
        onDiagramUpdate={handleDiagramUpdate}
        onNodePositionChange={handleNodePositionChange}
      />
    </ReactFlowProvider>
  );
};

export default SequenceDiagramManager;