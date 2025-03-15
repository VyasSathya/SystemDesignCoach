import React from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data }) => {
  const NodeIcon = data.icon;

  return (
    <div className={`
      relative
      px-4 py-3
      shadow-lg
      rounded-lg
      bg-${data.bgColor}
      border-2 border-${data.color}
      min-w-[160px]
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className={`w-3 h-3 !bg-${data.color}`}
      />
      
      <div className="flex items-center gap-3">
        <div className={`
          p-2
          rounded-lg
          bg-${data.color}/10
        `}>
          <NodeIcon className={`w-6 h-6 text-${data.color}`} />
        </div>
        
        <div>
          <div className={`text-xs font-medium text-${data.color} mb-1`}>
            {data.type.toUpperCase()}
          </div>
          <div className="text-sm font-bold text-gray-800">
            {data.label}
          </div>
          {data.notes && (
            <div className="text-xs text-gray-500 mt-1">
              {data.notes}
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className={`w-3 h-3 !bg-${data.color}`}
      />
    </div>
  );
};

export default React.memo(CustomNode);