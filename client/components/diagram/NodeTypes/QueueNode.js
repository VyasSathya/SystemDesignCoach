// client/components/diagram/NodeTypes/QueueNode.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import { Box } from 'lucide-react';

const QueueNode = ({ data, isConnectable }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-yellow-500">
      <div className="flex items-center">
        <Box className="h-8 w-8 text-yellow-500 mr-2" />
        <div>
          <div className="text-xs text-yellow-700 font-medium bg-yellow-50 px-1 rounded mb-1">Queue</div>
          <div className="text-sm font-bold">{data.label}</div>
          {data.notes && (
            <div className="text-xs text-gray-500 mt-1">{data.notes}</div>
          )}
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-yellow-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-yellow-500"
      />
    </div>
  );
};

export default memo(QueueNode);