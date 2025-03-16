import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data, isConnectable = true }) => {
  console.log('CustomNode render:', { data, isConnectable }); // Add this log

  // Add safety checks
  if (!data) {
    console.error('CustomNode received null or undefined data');
    return null;
  }

  const borderColorClass = `border-${data.style?.borderColor?.replace('border-', '') || 'gray-300'}`;
  const bgColorClass = `bg-${data.style?.backgroundColor?.replace('bg-', '') || 'white'}`;
  const textColorClass = `text-${data.style?.color?.replace('text-', '') || 'gray-900'}`;

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${borderColorClass} min-w-[150px]`}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ background: '#555' }}
        id="t"
      />
      <Handle
        type="source"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ background: '#555' }}
        id="ts"
      />
      
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ background: '#555' }}
        id="l"
      />
      <Handle
        type="source"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ background: '#555' }}
        id="ls"
      />
      
      <div className="flex items-center">
        {data.categoryIcon && (
          <data.categoryIcon className={`w-5 h-5 ${textColorClass} mr-2`} />
        )}
        <div>
          <div className={`text-xs ${textColorClass} font-medium ${bgColorClass} px-1 rounded mb-1`}>
            {data.nodeType}
          </div>
          <div className="text-sm font-bold">{data.label || data.nodeType}</div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ background: '#555' }}
        id="rs"
      />
      <Handle
        type="target"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ background: '#555' }}
        id="r"
      />
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ background: '#555' }}
        id="bs"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ background: '#555' }}
        id="b"
      />
    </div>
  );
};

// Ensure the component is memoized
export default memo(CustomNode);