import React, { useState } from 'react';
import { Users, Network, Server, Database, Shield, Plus } from 'lucide-react';

const NodePalette = ({ onNodeAdd }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Map of icons that we can reference
  const icons = {
    Users,
    Network,
    Server,
    Database,
    Shield,
    Plus
  };

  const nodeCategories = [
    {
      category: 'Clients',
      icon: Users,  // Use the actual component
      iconName: 'Users', // Store name for data transfer
      color: 'border-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      nodes: ['User', 'Internal User', 'Mobile App', 'Web App', 'Third-party App'],
    },
    {
      category: 'Network',
      icon: Network,
      iconName: 'Network',
      color: 'border-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      nodes: ['Load Balancer', 'CDN', 'Proxy Server', 'DNS', 'API Gateway'],
    },
    {
      category: 'Backend',
      icon: Server,
      iconName: 'Server',
      color: 'border-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      nodes: ['Microservice', 'Serverless Function', 'Application Server', 'Message Queue', 'Container'],
    },
    {
      category: 'Data',
      icon: Database,
      iconName: 'Database',
      color: 'border-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      nodes: ['Object Storage', 'SQL Database', 'NoSQL Database', 'Cache', 'Logging'],
    },
    {
      category: 'Security',
      icon: Shield,
      iconName: 'Shield',
      color: 'border-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      nodes: ['Authentication Server', 'Firewall', 'Identity Provider', 'Encryption Service', 'Monitoring Logs'],
    },
    {
      category: 'Custom',
      icon: Plus,
      iconName: 'Plus',
      color: 'border-gray-500',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      nodes: ['Custom'],
    },
  ];

  const handleNodeAdd = (nodeType, categoryData) => {
    const nodeData = {
      type: 'custom',
      data: {
        nodeType: nodeType,
        iconName: categoryData.iconName,
        style: {
          borderColor: categoryData.color.replace('border-', ''),
          backgroundColor: categoryData.bgColor.replace('bg-', ''),
          color: categoryData.textColor.replace('text-', '')
        }
      }
    };
    onNodeAdd(nodeData);
  };

  return (
    <div className="bg-white border-t border-gray-200">
      <div className="flex justify-between items-center px-4 py-3">
        {nodeCategories.map((categoryData) => {
          const IconComponent = categoryData.icon;
          return (
            <div
              key={categoryData.category}
              className="relative"
              onClick={() => setExpandedCategory(expandedCategory === categoryData.category ? null : categoryData.category)}
            >
              <div className={`
                flex items-center gap-2 px-4 py-2.5
                border-2 rounded-md ${categoryData.color}
                ${expandedCategory === categoryData.category ? categoryData.bgColor : 'hover:' + categoryData.bgColor}
                transition-colors duration-150
                cursor-pointer
                w-28
              `}>
                <div className={categoryData.textColor}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium truncate">{categoryData.category}</span>
              </div>

              {expandedCategory === categoryData.category && (
                <div className={`
                  absolute bottom-full mb-2 
                  ${categoryData.category === 'Custom' ? 'right-0' : 'left-0'} 
                  w-40 bg-white border border-gray-200 rounded-md shadow-lg p-2
                `}>
                  {categoryData.nodes.map((nodeType) => (
                    <div
                      key={nodeType}
                      className={`
                        px-4 py-2 text-sm rounded cursor-pointer
                        border-2 ${categoryData.color} ${categoryData.bgColor} hover:${categoryData.bgColor}
                        w-full truncate transition-colors duration-150
                        mb-1 last:mb-0
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNodeAdd(nodeType, categoryData);
                        setExpandedCategory(null);
                      }}
                    >
                      {nodeType}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NodePalette;
