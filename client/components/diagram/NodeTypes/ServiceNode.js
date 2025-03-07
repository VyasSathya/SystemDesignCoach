import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Server } from 'lucide-react';

const ServiceNode = ({ data, isConnectable }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-green-500">
      <div className="flex items-center">
        <Server className="h-8 w-8 text-green-500 mr-2" />
        <div>
          <div className="text-sm font-bold">{data.label}</div>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500"
      />
    </div>
  );
};

export default memo(ServiceNode);