// client/components/diagram/NodeTypes/FixedLifelineNode.js
import React, { memo, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';

/**
 * FixedLifelineNode - A lifeline node that maintains vertical alignment with its parent participant
 * 
 * This node solves the problem of lifelines moving up and down and breaking message alignment
 * by fixing its vertical position and only allowing horizontal repositioning through its parent.
 */
const FixedLifelineNode = memo(({ id, data, selected, xPos, yPos }) => {
  const updateNodeInternals = useUpdateNodeInternals();
  
  // Fixed vertical position from the top participant/actor
  const FIXED_TOP_POSITION = 120; // Distance from participant to where lifeline starts
  
  // Effect to update node internals when parent participant moves horizontally
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, xPos, updateNodeInternals]);
  
  return (
    <div 
      className={`sequence-lifeline-node ${selected ? 'border-l-2 border-gray-500' : ''}`} 
      style={{ 
        width: '2px', 
        height: data.height || 400,
        position: 'relative',
        pointerEvents: 'all'
      }}
    >
      {/* The vertical lifeline */}
      <div className="w-0.5 h-full bg-gray-300 mx-auto relative">
        {/* Activation boxes rendered on top of lifeline */}
        {data.activations && data.activations.map((activation, index) => (
          <div 
            key={index}
            className={`bg-${activation.color || 'blue'}-200 border border-${activation.color || 'blue'}-400`}
            style={{
              position: 'absolute',
              width: '10px',
              height: `${activation.height}px`,
              left: '-4px',
              top: `${activation.top}px`,
              zIndex: activation.nestLevel || 1
            }}
          />
        ))}
      </div>
      
      {/* Connection points - critical for messages */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        isConnectable={false}
        style={{ visibility: 'hidden' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-3 h-3 bg-gray-500"
        isConnectable={true}
        style={{ right: '-6px', top: '50%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="w-3 h-3 bg-gray-500"
        isConnectable={true}
        style={{ left: '-6px', top: '50%' }}
      />
    </div>
  );
});

export default FixedLifelineNode;