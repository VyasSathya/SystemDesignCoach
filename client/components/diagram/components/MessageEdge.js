import React from 'react';

const MessageEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  style = {},
}) => {
  // Force horizontal alignment
  const adjustedTargetY = sourceY;
  
  // Create horizontal-only path
  const edgePath = `M${sourceX},${sourceY} L${targetX},${sourceY}`;
  
  // Determine message type and corresponding marker
  const messageType = data?.type || 'sync';
  const markerEnd = `url(#${messageType}-arrow)`;
  
  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          strokeDasharray: messageType === 'async' ? '5,5' : 'none',
          stroke: messageType === 'return' ? '#666' : '#333',
          strokeWidth: 1.5
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      
      {data?.label && (
        <text
          x={(sourceX + targetX) / 2}
          y={sourceY - 10}
          textAnchor="middle"
          style={{ 
            fontSize: '12px', 
            fill: '#666',
            userSelect: 'none'
          }}
        >
          {data.label}
        </text>
      )}
    </>
  );
};

export default MessageEdge;