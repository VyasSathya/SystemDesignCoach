import React, { useState } from 'react';
import { 
  Users, Globe, Server, Database, Shield, 
  Network, Cloud, HardDrive, Lock, Activity,
  Cpu, MessageSquare, Box, Share2, Layers,
  Smartphone, ExternalLink, Package, Zap, Key,
  Trash2, Edit
} from 'lucide-react';

interface NodeCategory {
  category: string;
  color: string;
  nodes: {
    label: string;
    icon: React.ReactNode;
    type: string;
  }[];
}

interface SystemDesignPaletteProps {
  onNodeAdd: (type: string, label: string) => void;
  onNodeDelete?: (nodeId: string) => void;
  onNodeRename?: (nodeId: string, newName: string) => void;
  selectedNode?: { id: string; data: { label: string } } | null;
}

const SystemDesignPalette: React.FC<SystemDesignPaletteProps> = ({ 
  onNodeAdd, 
  onNodeDelete, 
  onNodeRename,
  selectedNode 
}) => {
  const [editingLabel, setEditingLabel] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleStartEdit = () => {
    if (selectedNode) {
      setEditingLabel(selectedNode.data.label);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (selectedNode && onNodeRename) {
      onNodeRename(selectedNode.id, editingLabel);
      setIsEditing(false);
    }
  };

  const nodeCategories: NodeCategory[] = [
    {
      category: 'Users & Clients',
      color: 'bg-blue-100',
      nodes: [
        { label: 'User', icon: <Users className="w-4 h-4" />, type: 'user' },
        { label: 'Web Client', icon: <Globe className="w-4 h-4" />, type: 'client' },
        { label: 'Mobile App', icon: <Smartphone className="w-4 h-4" />, type: 'mobile' },
        { label: 'Third-party', icon: <ExternalLink className="w-4 h-4" />, type: 'thirdParty' }
      ]
    },
    {
      category: 'Compute & Services',
      color: 'bg-purple-100',
      nodes: [
        { label: 'Server', icon: <Server className="w-4 h-4" />, type: 'server' },
        { label: 'Microservice', icon: <Cpu className="w-4 h-4" />, type: 'microservice' },
        { label: 'Lambda', icon: <Box className="w-4 h-4" />, type: 'lambda' },
        { label: 'Container', icon: <Package className="w-4 h-4" />, type: 'container' }
      ]
    },
    {
      category: 'Data Storage',
      color: 'bg-yellow-100',
      nodes: [
        { label: 'SQL Database', icon: <Database className="w-4 h-4" />, type: 'sql' },
        { label: 'NoSQL DB', icon: <HardDrive className="w-4 h-4" />, type: 'nosql' },
        { label: 'Cache', icon: <Zap className="w-4 h-4" />, type: 'cache' },
        { label: 'Queue', icon: <MessageSquare className="w-4 h-4" />, type: 'queue' }
      ]
    },
    {
      category: 'Network & Infrastructure',
      color: 'bg-green-100',
      nodes: [
        { label: 'Load Balancer', icon: <Share2 className="w-4 h-4" />, type: 'loadBalancer' },
        { label: 'API Gateway', icon: <Network className="w-4 h-4" />, type: 'gateway' },
        { label: 'CDN', icon: <Cloud className="w-4 h-4" />, type: 'cdn' },
        { label: 'Proxy', icon: <Layers className="w-4 h-4" />, type: 'proxy' }
      ]
    },
    {
      category: 'Security & Monitoring',
      color: 'bg-red-100',
      nodes: [
        { label: 'Auth Server', icon: <Lock className="w-4 h-4" />, type: 'auth' },
        { label: 'Firewall', icon: <Shield className="w-4 h-4" />, type: 'firewall' },
        { label: 'Monitoring', icon: <Activity className="w-4 h-4" />, type: 'monitoring' },
        { label: 'Encryption', icon: <Key className="w-4 h-4" />, type: 'encryption' }
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Node Operations Panel */}
      {selectedNode && (
        <div className="p-4 border-b bg-white">
          <h3 className="font-semibold mb-2">Selected Node: {selectedNode.data.label}</h3>
          <div className="flex gap-2">
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingLabel}
                  onChange={(e) => setEditingLabel(e.target.value)}
                  className="border px-2 py-1 rounded"
                />
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                <Edit className="w-4 h-4" />
                Rename
              </button>
            )}
            <button
              onClick={() => onNodeDelete && onNodeDelete(selectedNode.id)}
              className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Node Palette */}
      <div className="p-4 flex flex-col gap-4 border-2 rounded-lg shadow-sm bg-gray-50 overflow-y-auto">
        {nodeCategories.map(({ category, nodes, color }) => (
          <div key={category}>
            <h3 className="text-md font-semibold mb-2">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {nodes.map((node) => (
                <div
                  key={node.type}
                  className={`px-3 py-2 ${color} border border-gray-200 rounded cursor-pointer 
                    hover:bg-opacity-80 flex items-center gap-2 transition-colors duration-200`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow', JSON.stringify({
                      type: node.type,
                      label: node.label
                    }));
                  }}
                  onClick={() => onNodeAdd(node.type, node.label)}
                >
                  {node.icon}
                  <span className="text-sm">{node.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemDesignPalette;