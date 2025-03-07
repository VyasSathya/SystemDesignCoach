import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Globe } from 'lucide-react';

const ClientNode = ({ data, isConnectable }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-500">
      <div className="flex items-center">
        <Globe className="h-8 w-8 text-blue-500 mr-2" />
        <div>
          <div className="text-sm font-bold">{data.label}</div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
    </div>
  );
};

export default memo(ClientNode);