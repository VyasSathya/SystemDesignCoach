import React from 'react';
import styles from '../styles/messages.module.css';

const Message = ({ data, selected, sourceX, sourceY, targetX, targetY }) => {
  const isAsync = data.type === 'ASYNC';
  
  return (
    <div className={`
      ${styles.messageContainer}
      ${selected ? styles.messageSelected : ''}
      ${data.error ? styles.messageError : ''}
      ${isAsync ? styles.asyncMessage : styles.syncMessage}
    `}>
      <path
        className={styles.messagePath}
        d={`M ${sourceX} ${sourceY} L ${targetX} ${targetY}`}
        markerEnd="url(#arrowhead)"
      />
      <text
        className={styles.messageLabel}
        x={(sourceX + targetX) / 2}
        y={sourceY - 10}
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {data.label}
      </text>
    </div>
  );
};

export default Message;