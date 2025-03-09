// client/components/diagram/NodeTypes/LoadBalancerNode.js
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Grid } from 'lucide-react';

const LoadBalancerNode = ({ data, isConnectable }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-orange-500">
      <div className="flex items-center">
        <Grid className="h-8 w-8 text-orange-500 mr-2" />
        <div>
          <div className="text-xs text-orange-700 font-medium bg-orange-50 px-1 rounded mb-1">Load Balancer</div>
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
        className="w-3 h-3 bg-orange-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-orange-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-orange-500"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-orange-500"
      />
    </div>
  );
};

export default memo(LoadBalancerNode);