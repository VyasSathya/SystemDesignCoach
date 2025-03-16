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
  
  // Calculate arrow direction
  const isRightToLeft = targetX < sourceX;
  const arrowSize = 8;
  
  // Create horizontal-only path
  const edgePath = `M${sourceX},${sourceY} L${targetX},${sourceY}`;
  
  // Arrow path based on direction and type
  const arrowPath = isRightToLeft
    ? `M${targetX + arrowSize},${sourceY - arrowSize} L${targetX},${sourceY} L${targetX + arrowSize},${sourceY + arrowSize}`
    : `M${targetX - arrowSize},${sourceY - arrowSize} L${targetX},${sourceY} L${targetX - arrowSize},${sourceY + arrowSize}`;

  const isAsync = data?.type === 'async';
  
  return (
    <>
      {/* Message Line */}
      <path
        id={id}
        style={{
          ...style,
          strokeDasharray: isAsync ? '5,5' : 'none',
          stroke: '#333',
          strokeWidth: 1.5,
        }}
        className="react-flow__edge-path"
        d={edgePath}
      />
      
      {/* Message Label */}
      <text
        x={(sourceX + targetX) / 2}
        y={sourceY - 10}
        textAnchor="middle"
        style={{ fontSize: '12px', fill: '#666' }}
      >
        {data?.label || ''}
      </text>
      
      {/* Arrow Head */}
      <path
        d={arrowPath}
        style={{
          fill: isAsync ? 'none' : '#333',
          stroke: '#333',
          strokeWidth: 1.5,
        }}
      />
    </>
  );
};

export default MessageEdge;