import React from 'react';
import { Handle, Position } from 'reactflow';
import { CONSTANTS } from '../utils/sequenceDiagramConstants';

const Lifeline = ({ data, isConnectable }) => {
  const { parentType, connections } = data;
  const color = CONSTANTS.PARTICIPANT_COLORS[parentType] || CONSTANTS.PARTICIPANT_COLORS.SYSTEM;

  return (
    <div className="lifeline">
      <div 
        className="lifeline-line"
        style={{
          borderColor: color,
          height: '100%'
        }}
      />
      
      {connections.map((connection, index) => (
        <Handle
          key={index}
          type="target"
          position={Position.Left}
          id={`connection-${index}`}
          style={{ left: -5, top: connection.position }}
          isConnectable={isConnectable}
        />
      ))}
    </div>
  );
};

export default Lifeline;