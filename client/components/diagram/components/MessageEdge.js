import React from 'react';
import { BaseEdge, getStraightPath } from 'reactflow';
import { CONSTANTS } from '../utils/sequenceDiagramConstants';

const MessageEdge = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data
}) => {
  const messageType = data?.type || CONSTANTS.MESSAGE_TYPES.SYNC;
  const style = CONSTANTS.STYLES[`${messageType.toUpperCase()}_MESSAGE`];
  
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY
  });

  const markerEnd = `url(#${messageType}-arrow)`;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeDasharray: style.strokeDasharray,
          stroke: style.stroke,
          strokeWidth: style.strokeWidth
        }}
      />
      {data?.label && (
        <text
          x={labelX}
          y={labelY - 10}
          textAnchor="middle"
          alignmentBaseline="central"
          className="message-label"
        >
          {data.label}
        </text>
      )}
    </>
  );
};

export default MessageEdge;