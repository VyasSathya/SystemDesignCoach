import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import * as LucideIcons from 'lucide-react';
import styles from './CustomNode.module.css';

const CustomNode = ({ data, id }) => {
  const IconComponent = data.categoryIcon || LucideIcons.Box;

  return (
    <div
      className={`
        ${styles.nodeContainer}
        ${data.style?.backgroundColor}
        border-2 border-${data.style?.borderColor}
        shadow-md
      `}
    >
      <Handle 
        type="source" 
        position={Position.Top} 
        id="top"
        style={{ top: -3, width: 10, height: 10 }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom"
        style={{ bottom: -3, width: 10, height: 10 }}
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        id="left"
        style={{ left: -3, width: 10, height: 10 }}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="right"
        style={{ right: -3, width: 10, height: 10 }}
      />
      
      <div className={styles.contentWrapper}>
        <IconComponent 
          className={`w-6 h-6 text-${data.style?.color}`}
        />
        
        <div>
          <div className={styles.label}>{data.label}</div>
          <div className={`${styles.type} text-${data.style?.color}`}>
            {data.nodeType}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(CustomNode);