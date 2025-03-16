import React from 'react';
import { Handle, Position } from 'reactflow';
import { CONSTANTS } from '../utils/sequenceDiagramConstants';

const Participant = ({ data, id, isConnectable, onMouseDown, onMouseUp }) => {
  const getParticipantStyle = (type) => {
    return {
      backgroundColor: CONSTANTS.PARTICIPANT_COLORS[type],
      color: 'white',
      width: CONSTANTS.LAYOUT.PARTICIPANT_WIDTH,
      height: CONSTANTS.LAYOUT.PARTICIPANT_HEIGHT,
      cursor: 'pointer',
    };
  };

  return (
    <div
      className="participant-node"
      onMouseDown={(e) => {
        // Prevent drag when trying to draw message
        if (e.button === 0) { // Left click only
          onMouseDown?.(e, { id, data });
        }
      }}
      onMouseUp={(e) => {
        if (e.button === 0) { // Left click only
          onMouseUp?.(e, { id, data });
        }
      }}
    >
      <div
        className="participant-box rounded-lg flex items-center justify-center p-2"
        style={getParticipantStyle(data.type)}
      >
        <span className="font-medium text-sm">{data.name}</span>
      </div>
      
      <div 
        className="lifeline"
        style={{
          position: 'absolute',
          left: '50%',
          top: CONSTANTS.LAYOUT.PARTICIPANT_HEIGHT,
          width: CONSTANTS.LAYOUT.LIFELINE_WIDTH,
          height: '100vh',
          backgroundColor: '#ddd',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: -1
        }}
      />
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ visibility: 'hidden' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ visibility: 'hidden' }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default Participant;