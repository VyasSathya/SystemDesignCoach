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
    // For sequence diagrams, keep messages horizontal
    // Use the source Y position for both source and target points
    // Use same Y for both points to create horizontal lines
    const messagePath = `M${sourceX},${sourceY} L${targetX},${sourceY}`;
    const messageText = data?.label || '';
    const isReturn = data?.type === 'return';
    const isAsync = data?.type === 'async';
    
    // Calculate text positioning
    const textX = (sourceX + targetX) / 2;
    const textY = sourceY - 10; // Position text above the line
    
    // Always draw arrow at target point
    const arrowPath = targetX > sourceX
      ? `M${targetX - 5},${sourceY - 5} L${targetX},${sourceY} L${targetX - 5},${sourceY + 5}` // arrow pointing right
      : `M${targetX + 5},${sourceY - 5} L${targetX},${sourceY} L${targetX + 5},${sourceY + 5}`; // arrow pointing left
    
    return (
      <>
        <path
          id={id}
          style={{ 
            ...style, 
            strokeDasharray: isReturn || isAsync ? '5,5' : 'none',
            stroke: isReturn ? '#888' : '#333',
            strokeWidth: 1.5
          }}
          className="react-flow__edge-path"
          d={messagePath}
        />
        {messageText && (
          <text
            x={textX}
            y={textY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs fill-gray-700"
            style={{ fontSize: 10, fontFamily: 'sans-serif' }}
          >
            {messageText}
          </text>
        )}
        {/* Arrow head - always at target point */}
        <path
          d={arrowPath}
          style={{
            fill: 'none',
            stroke: isReturn ? '#888' : '#333',
            strokeWidth: 1.5
          }}
        />
      </>
    );
  };