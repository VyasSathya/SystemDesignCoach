// client/components/diagram/NodeTypes/ServiceNode.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import { Server } from 'lucide-react';

const ServiceNode = ({ data, isConnectable }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-500">
      <div className="flex items-center">
        <Server className="h-8 w-8 text-blue-500 mr-2" />
        <div>
          <div className="text-xs text-blue-700 font-medium bg-blue-50 px-1 rounded mb-1">Service</div>
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
        className="w-3 h-3 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
    </div>
  );
};

export default memo(ServiceNode);