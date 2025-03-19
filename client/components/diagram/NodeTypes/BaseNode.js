import React from 'react';
import { Handle, Position } from 'reactflow';
import { 
  Users, 
  Database, 
  Server 
} from 'lucide-react';

const iconMap = {
  user: Users,
  database: Database,
  system: Server,
};

const BaseNode = ({ data, selected }) => {
  const Icon = iconMap[data.nodeType] || Server;
  
  return (
    <div
      className={`
        px-4 py-2 rounded-lg shadow-sm border-2 transition-all
        ${selected ? 'border-blue-500 shadow-md' : 'border-gray-200'}
        ${data.nodeType === 'user' ? 'bg-green-50' : 
          data.nodeType === 'database' ? 'bg-purple-50' : 'bg-blue-50'}
      `}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-gray-400"
      />
      
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium text-gray-700">
          {data.label}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-gray-400"
      />
    </div>
  );
};

export default BaseNode;