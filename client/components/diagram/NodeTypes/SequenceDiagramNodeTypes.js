// client/components/diagram/NodeTypes/SequenceDiagramNodeTypes.js
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { User, Server, Database } from 'lucide-react';

const getNodeStyle = (type) => {
  const styles = {
    user: {
      icon: <User className="w-6 h-6" />,
      background: 'bg-blue-50',
      border: 'border-blue-300',
      hoverBg: 'hover:bg-blue-50',
      selectedBorder: 'border-blue-500',
      iconColor: 'text-blue-500'
    },
    system: {
      icon: <Server className="w-6 h-6" />,
      background: 'bg-green-50',
      border: 'border-green-300',
      hoverBg: 'hover:bg-green-50',
      selectedBorder: 'border-green-500',
      iconColor: 'text-green-500'
    },
    database: {
      icon: <Database className="w-6 h-6" />,
      background: 'bg-purple-50',
      border: 'border-purple-300',
      hoverBg: 'hover:bg-purple-50',
      selectedBorder: 'border-purple-500',
      iconColor: 'text-purple-500'
    }
  };
  return styles[type] || styles.system;
};

/**
 * Base Node Component for Sequence Diagram
 */
const BaseNode = memo(({ data, selected }) => {
  const style = getNodeStyle(data.type);
  
  return (
    <div 
      className="group relative"
      style={{ minWidth: '120px' }}
    >
      <div 
        className={`
          px-4 py-3 rounded-lg shadow-sm border-2 transition-all
          ${style.background}
          ${selected ? style.selectedBorder : style.border}
          ${style.hoverBg}
          hover:shadow-md
        `}
      >
        <div className="flex items-center gap-2 justify-center">
          <div className={`${style.iconColor}`}>
            {style.icon}
          </div>
          <div className="text-sm font-medium text-gray-700">
            {data.label || 'Unnamed'}
          </div>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!bottom-0 !bg-gray-400"
      />
      
      {/* Lifeline */}
      <div 
        className="absolute w-[2px] bg-gray-300"
        style={{
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          height: data.lifelineHeight || '400px',
          zIndex: -1
        }}
      />
    </div>
  );
});

export const sequenceDiagramNodeTypes = {
  user: BaseNode,
  system: BaseNode,
  database: BaseNode
};