import React from 'react';
import { BaseEdge, getStraightPath } from 'reactflow';

const MessageEdge = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  style = {}
}) => {
  const messageType = data?.type || 'sync';
  
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY
  });

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          ...style,
          strokeDasharray: messageType === 'async' ? '5, 5' : 'none',
          stroke: '#333',
          strokeWidth: 2
        }}
        markerEnd={`url(#${messageType}-arrow)`}
      />
      {data?.label && (
        <text
          x={(sourceX + targetX) / 2}
          y={sourceY - 10}
          textAnchor="middle"
          style={{ fontSize: '12px', fill: '#666' }}
        >
          {data?.label}
        </text>
      )}
    </>
  );
};

export default MessageEdge;