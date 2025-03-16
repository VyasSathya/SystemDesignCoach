// Simplified SequenceDiagram components
// Includes:
// 1. Simplified MessageEdge - fixes arrow direction issues
// 2. Simplified LifelineNode - uses single connection points for cleaner interaction
// 3. Simplified onConnect function - handles connections between lifelines
const MessageEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  style = {},
}) => {
  // Keep messages horizontal
  const edgePath = `M${sourceX},${sourceY} L${targetX},${sourceY}`;
  const messageText = data?.label || '';
  const isReturn = data?.type === 'return';
  const isAsync = data?.type === 'async';
  
  // Calculate arrow direction
  const isRightToLeft = targetX < sourceX;
  const arrowSize = 8;
  
  // Arrow path based on direction
  const arrowPath = isRightToLeft
    ? `M${targetX + arrowSize},${sourceY - arrowSize} L${targetX},${sourceY} L${targetX + arrowSize},${sourceY + arrowSize}`
    : `M${targetX - arrowSize},${sourceY - arrowSize} L${targetX},${sourceY} L${targetX - arrowSize},${sourceY + arrowSize}`;

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          strokeDasharray: isAsync ? '5,5' : 'none',
          stroke: isReturn ? '#888' : '#333',
          strokeWidth: 1.5,
        }}
        className="react-flow__edge-path"
        d={edgePath}
      />
      {/* Message label */}
      <text
        x={(sourceX + targetX) / 2}
        y={sourceY - 10}
        textAnchor="middle"
        style={{ fontSize: '12px', fill: '#666' }}
      >
        {messageText}
      </text>
      {/* Arrow head */}
      <path
        d={arrowPath}
        style={{
          fill: 'none',
          stroke: isReturn ? '#888' : '#333',
          strokeWidth: 1.5,
        }}
      />
    </>
  );
  };