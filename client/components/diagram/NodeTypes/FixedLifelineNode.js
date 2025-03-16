// client/components/diagram/NodeTypes/FixedLifelineNode.js
import React, { memo, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';

/**
 * FixedLifelineNode - A lifeline node that maintains vertical alignment with its parent participant
 * 
 * This node solves the problem of lifelines moving up and down and breaking message alignment
 * by fixing its vertical position and only allowing horizontal repositioning through its parent.
 */
const FixedLifelineNode = memo(({ id, data, selected, xPos }) => {
  const updateNodeInternals = useUpdateNodeInternals();
  
  // Fixed vertical position from the top participant/actor
  const FIXED_TOP_POSITION = 120; // Distance from participant to where lifeline starts
  const LIFELINE_LENGTH = data.timeExtent || 800; // Dynamic length based on messages
  
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, xPos, updateNodeInternals]);
  
  return (
    <div 
      className={`lifeline-node ${selected ? 'selected' : ''}`}
      style={{
        position: 'relative',
        height: LIFELINE_LENGTH,
        width: 2,
        backgroundColor: '#ddd',
        borderStyle: 'dashed'
      }}
    >
      {/* Multiple handles along the lifeline for message connections */}
      {Array.from({ length: Math.floor(LIFELINE_LENGTH / 50) }).map((_, index) => (
        <React.Fragment key={index}>
          <Handle
            type="target"
            position={Position.Left}
            style={{ top: index * 50 }}
            id={`target-${index}`}
          />
          <Handle
            type="source"
            position={Position.Right}
            style={{ top: index * 50 }}
            id={`source-${index}`}
          />
        </React.Fragment>
      ))}
      
      {/* Activation bars for when the participant is active */}
      {data.activations?.map((activation, index) => (
        <div
          key={index}
          className="activation-bar"
          style={{
            position: 'absolute',
            left: -4,
            width: 10,
            backgroundColor: '#666',
            top: activation.start,
            height: activation.end - activation.start
          }}
        />
      ))}
    </div>
  );
});

export default FixedLifelineNode;