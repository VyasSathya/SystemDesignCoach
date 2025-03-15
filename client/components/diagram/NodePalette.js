import React, { useState } from 'react';
import { Users, Network, Server, Database, Shield } from 'lucide-react';

const NodePalette = ({ onNodeAdd }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const nodeCategories = [
    {
      category: 'Users & Clients',
      icon: <Users className="w-5 h-5" />,
      color: 'border-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      nodes: ['User', 'Internal User', 'Mobile App', 'Web App', 'Third-party App'],
    },
    {
      category: 'Network & Delivery',
      icon: <Network className="w-5 h-5" />,
      color: 'border-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      nodes: ['Load Balancer', 'CDN', 'Proxy Server', 'DNS', 'API Gateway'],
    },
    {
      category: 'Backend & Compute',
      icon: <Server className="w-5 h-5" />,
      color: 'border-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      nodes: ['Microservice', 'Serverless Function', 'Application Server', 'Message Queue', 'Container'],
    },
    {
      category: 'Data & Storage',
      icon: <Database className="w-5 h-5" />,
      color: 'border-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      nodes: ['Object Storage', 'SQL Database', 'NoSQL Database', 'Cache', 'Logging'],
    },
    {
      category: 'Security & Identity',
      icon: <Shield className="w-5 h-5" />,
      color: 'border-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      nodes: ['Authentication Server', 'Firewall', 'Identity Provider', 'Encryption Service', 'Monitoring Logs'],
    },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
      {/* Main menu */}
      <div className="flex justify-center gap-2 p-2">
        {nodeCategories.map(({ category, icon, color, bgColor, textColor }) => (
          <div
            key={category}
            className="relative cursor-pointer"
            onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
          >
            <div className={`
              flex items-center gap-2 p-2 
              border-2 rounded-md ${color}
              ${expandedCategory === category ? bgColor : 'hover:' + bgColor}
              transition-colors duration-150
            `}>
              <div className={textColor}>{icon}</div>
              <span className="text-sm font-medium">{category}</span>
            </div>

            {/* Expandable submenu */}
            {expandedCategory === category && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg p-2">
                <div className="flex flex-wrap gap-1">
                  {nodeCategories
                    .find(cat => cat.category === category)
                    .nodes.map((nodeLabel) => (
                      <div
                        key={nodeLabel}
                        className={`
                          px-3 py-1 text-sm rounded cursor-pointer
                          border-2 ${color} ${bgColor} hover:${bgColor}
                          w-full truncate transition-colors duration-150
                        `}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('application/reactflow', nodeLabel)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onNodeAdd && onNodeAdd(nodeLabel);
                          setExpandedCategory(null);
                        }}
                      >
                        {nodeLabel}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodePalette;
