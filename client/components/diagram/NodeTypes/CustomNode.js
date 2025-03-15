import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import * as LucideIcons from 'lucide-react';
import styles from './CustomNode.module.css';

const CustomNode = ({ data }) => {
  // Get the icon component from Lucide icons
  const IconComponent = data.categoryIcon || LucideIcons.Box;

  return (
    <div
      className={`
        ${styles.nodeContainer}
        ${data.style.backgroundColor}
        border-2 border-${data.style.borderColor}
        shadow-md
      `}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className={styles.handleTop}
      />
      
      <div className={styles.contentWrapper}>
        <IconComponent 
          className={`w-6 h-6 text-${data.style.color}`}
        />
        
        <div>
          <div className={styles.label}>{data.label}</div>
          <div className={`${styles.type} text-${data.style.color}`}>
            {data.nodeType}
          </div>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={styles.handleBottom}
      />
    </div>
  );
};

export default memo(CustomNode);