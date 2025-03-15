import React from 'react';
import { 
  Globe, Server, Database, Share2, Archive, Box, 
  Gateway, Network, Trash2 
} from 'lucide-react';

const DiagramToolbar = ({ mode, setMode, onAddNode, hideModes = false }) => {
  const nodeTypes = [
    { type: 'client', icon: Globe, label: 'Client' },
    { type: 'service', icon: Server, label: 'Service' },
    { type: 'database', icon: Database, label: 'Database' },
    { type: 'loadBalancer', icon: Share2, label: 'Load Balancer' },
    { type: 'cache', icon: Archive, label: 'Cache' },
    { type: 'queue', icon: Box, label: 'Queue' },
    { type: 'gateway', icon: Gateway, label: 'API Gateway' },
    { type: 'network', icon: Network, label: 'Network' }
  ];

  return (
    <div className="flex items-center justify-center gap-2 p-3 bg-white border-t border-gray-200">
      {nodeTypes.map((item) => (
        <button
          key={item.type}
          onClick={() => onAddNode(item.type)}
          className="flex items-center gap-2 px-4 py-2 rounded bg-white hover:bg-gray-50"
        >
          <item.icon className="w-5 h-5 text-gray-600" />
          <span>{item.label}</span>
        </button>
      ))}
      
      <button
        onClick={() => onAddNode('delete')}
        className="flex items-center gap-2 px-4 py-2 rounded bg-white hover:bg-red-50 text-red-600"
      >
        <Trash2 className="w-5 h-5" />
        <span>Delete</span>
      </button>
    </div>
  );
};

export default DiagramToolbar;