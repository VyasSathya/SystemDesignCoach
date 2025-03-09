// client/components/diagram/NodeTypes/ServiceNode.js
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Server } from 'lucide-react';

const ServiceNode = ({ data, isConnectable }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-green-500">
      <div className="flex items-center">
        <Server className="h-8 w-8 text-green-500 mr-2" />
        <div>
          <div className="text-xs text-green-700 font-medium bg-green-50 px-1 rounded mb-1">Service</div>
          <div className="text-sm font-bold">{data.label}</div>
          {data.notes && (
            <div className="text-xs text-gray-500 mt-1">{data.notes}</div>
          )}
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
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500"
      />
    </div>
  );
};

export default memo(ServiceNode);