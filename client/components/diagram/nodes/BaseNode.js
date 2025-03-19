import React from 'react';
import { Handle, Position } from 'reactflow';

const BaseNode = ({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200">
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center">
        {data.icon && <div className="mr-2">{data.icon}</div>}
        <div className="text-sm font-medium">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default BaseNode;