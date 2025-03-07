// client/components/diagram/DiagramToolbar.js
import React from 'react';
import { Database, Server, Globe, Archive, Grid, Box, Share2 } from 'lucide-react';

const DiagramToolbar = () => {
  const nodeTypes = [
    {
      type: 'client',
      icon: <Globe className="h-5 w-5 text-blue-600" />,
      label: "Client",
    },
    {
      type: 'service',
      icon: <Server className="h-5 w-5 text-green-600" />,
      label: "Service",
    },
    {
      type: 'database',
      icon: <Database className="h-5 w-5 text-purple-600" />,
      label: "Database",
    },
    {
      type: 'cache',
      icon: <Archive className="h-5 w-5 text-red-600" />,
      label: "Cache",
    },
    {
      type: 'loadBalancer',
      icon: <Grid className="h-5 w-5 text-orange-600" />,
      label: "Load Balancer",
    },
    {
      type: 'microservice',
      icon: <Box className="h-5 w-5 text-teal-600" />,
      label: "Microservice",
    },
    {
      type: 'queue',
      icon: <Share2 className="h-5 w-5 text-indigo-600" />,
      label: "Queue",
    }
  ];

  // Handle dragging a node
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex flex-wrap gap-2">
      {nodeTypes.map((node) => (
        <div
          key={node.type}
          className="flex flex-col items-center p-2 bg-white border border-gray-200 rounded shadow-sm hover:bg-blue-50 hover:border-blue-200 transition-colors w-24 h-24 cursor-grab"
          onDragStart={(event) => onDragStart(event, node.type)}
          draggable
        >
          {node.icon}
          <span className="text-xs mt-2 text-center">{node.label}</span>
        </div>
      ))}
    </div>
  );
};

export default DiagramToolbar;