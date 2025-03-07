// client/components/MermaidToolbar.js
import React from 'react';
import { Database, Server, Globe, Archive, Grid, Box, Share2, ArrowRight } from 'lucide-react';

const ComponentButton = ({ icon, label, snippet, onInsert }) => (
  <button
    onClick={() => onInsert(snippet)}
    className="flex flex-col items-center p-2 bg-white border border-gray-200 rounded shadow-sm hover:bg-blue-50 hover:border-blue-200 transition-colors w-20 h-20"
  >
    {icon}
    <span className="text-xs mt-2 text-center">{label}</span>
  </button>
);

const MermaidToolbar = ({ onInsert }) => {
  const components = [
    {
      icon: <Globe className="h-5 w-5 text-blue-600" />,
      label: "Client",
      snippet: "Client[Client] --> API"
    },
    {
      icon: <Server className="h-5 w-5 text-green-600" />,
      label: "Server",
      snippet: "Server[API Server]"
    },
    {
      icon: <Database className="h-5 w-5 text-purple-600" />,
      label: "Database",
      snippet: "DB[(Database)]"
    },
    {
      icon: <Archive className="h-5 w-5 text-red-600" />,
      label: "Cache",
      snippet: "Cache[(Cache)]"
    },
    {
      icon: <Grid className="h-5 w-5 text-orange-600" />,
      label: "Load Balancer",
      snippet: "LB{Load Balancer}"
    },
    {
      icon: <Box className="h-5 w-5 text-teal-600" />,
      label: "Microservice",
      snippet: "Service[Microservice]"
    },
    {
      icon: <Share2 className="h-5 w-5 text-indigo-600" />,
      label: "Queue",
      snippet: "Queue([Message Queue])"
    },
    {
      icon: <ArrowRight className="h-5 w-5 text-gray-600" />,
      label: "Connection",
      snippet: "A --> B"
    }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {components.map((component, index) => (
        <ComponentButton
          key={index}
          icon={component.icon}
          label={component.label}
          snippet={component.snippet}
          onInsert={onInsert}
        />
      ))}
    </div>
  );
};

export default MermaidToolbar;