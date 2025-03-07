import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Archive } from 'lucide-react';

const CacheNode = ({ data, isConnectable }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-red-500">
      <div className="flex items-center">
        <Archive className="h-8 w-8 text-red-500 mr-2" />
        <div>
          <div className="text-sm font-bold">{data.label}</div>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-red-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-red-500"
      />
    </div>
  );
};

export default memo(CacheNode);