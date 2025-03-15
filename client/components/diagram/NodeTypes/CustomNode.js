// client/components/diagram/NodeTypes/CustomNode.js
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Server, Database, Circle, Cloud, Router } from 'lucide-react';

const iconMap = {
  service: Server,
  database: Database,
  cache: Circle,
  gateway: Cloud,
  loadbalancer: Router,
  queue: Circle,
};

function CustomNode({ data, type }) {
  const Icon = iconMap[type] || Server;
  
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200">
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center">
        <Icon className="h-6 w-6 mr-2" />
        <div className="text-sm font-medium">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default memo(CustomNode);