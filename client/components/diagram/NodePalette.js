import React, { useState } from 'react';
import { Users, Network, Server, Database, Shield } from 'lucide-react';

const NodePalette = ({ onNodeAdd }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const nodeCategories = [
    {
      category: 'Users & Clients',
      icon: Users,
      color: 'border-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      nodes: ['User', 'Internal User', 'Mobile App', 'Web App', 'Third-party App'],
    },
    {
      category: 'Network & Delivery',
      icon: Network,
      color: 'border-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      nodes: ['Load Balancer', 'CDN', 'Proxy Server', 'DNS', 'API Gateway'],
    },
    {
      category: 'Backend & Compute',
      icon: Server,
      color: 'border-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      nodes: ['Microservice', 'Serverless Function', 'Application Server', 'Message Queue', 'Container'],
    },
    {
      category: 'Data & Storage',
      icon: Database,
      color: 'border-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      nodes: ['Object Storage', 'SQL Database', 'NoSQL Database', 'Cache', 'Logging'],
    },
    {
      category: 'Security & Identity',
      icon: Shield,
      color: 'border-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      nodes: ['Authentication Server', 'Firewall', 'Identity Provider', 'Encryption Service', 'Monitoring Logs'],
    },
  ];

  const handleNodeAdd = (nodeType, categoryData) => {
    const nodeData = {
      type: 'custom', // This will use our CustomNode component
      data: {
        nodeType: nodeType,
        categoryIcon: categoryData.icon,
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
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex flex-wrap justify-center gap-2 p-2">
        {nodeCategories.map((categoryData) => (
          <div
            key={categoryData.category}
            className="relative"
            onClick={() => setExpandedCategory(expandedCategory === categoryData.category ? null : categoryData.category)}
          >
            <div className={`
              flex items-center gap-2 p-2 w-40
              border-2 rounded-md ${categoryData.color}
              ${expandedCategory === categoryData.category ? categoryData.bgColor : 'hover:' + categoryData.bgColor}
              transition-colors duration-150
              cursor-pointer
            `}>
              <div className={categoryData.textColor}>
                <categoryData.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium truncate">{categoryData.category}</span>
            </div>

            {expandedCategory === categoryData.category && (
              <div className="absolute bottom-full left-0 mb-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg p-2">
                {categoryData.nodes.map((nodeType) => (
                  <div
                    key={nodeType}
                    className={`
                      px-3 py-1 text-sm rounded cursor-pointer
                      border-2 ${categoryData.color} ${categoryData.bgColor} hover:${categoryData.bgColor}
                      w-full truncate transition-colors duration-150
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
        ))}
      </div>
    </div>
  );
};

export default NodePalette;
