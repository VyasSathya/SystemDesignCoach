import React from 'react';
import { Handle, Position } from 'reactflow';
import { CONSTANTS } from '../utils/sequenceDiagramConstants';

const ControlStructure = ({ data, isConnectable }) => {
  const { type, condition, messages } = data;
  const isLoop = type === CONSTANTS.CONTROL_TYPES.LOOP;
  
  return (
    <div className={`control-structure ${type.toLowerCase()}`}>
      <div className="control-header">
        <span className="control-type">{type}</span>
        {condition && (
          <span className="control-condition">[{condition}]</span>
        )}
      </div>
      
      {isLoop ? (
        <div className="loop-container">
          {messages && messages.map((msg, index) => (
            <div key={index} className="loop-message">
              {msg}
            </div>
          ))}
        </div>
      ) : (
        <div className="alt-container">
          {data.sections && data.sections.map((section, index) => (
            <div key={index} className="alt-section">
              <div className="section-condition">
                [{section.condition}]
              </div>
              <div className="section-messages">
                {section.messages.map((msg, msgIndex) => (
                  <div key={msgIndex} className="alt-message">
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default ControlStructure;