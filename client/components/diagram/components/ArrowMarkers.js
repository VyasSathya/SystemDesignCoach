import React from 'react';

// Define constants inline to avoid dependency issues
const MESSAGE_TYPES = {
  SYNC: 'sync',
  ASYNC: 'async',
  RETURN: 'return'
};

const STYLES = {
  SYNC_MESSAGE: {
    stroke: '#333'
  },
  ASYNC_MESSAGE: {
    stroke: '#333'
  },
  RETURN_MESSAGE: {
    stroke: '#666'
  }
};

const ArrowMarkers = () => {
  return (
    <defs>
      {/* Synchronous Message Arrow */}
      <marker
        id="sync-arrow"
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path
          d="M 0 0 L 10 5 L 0 10 z"
          fill={STYLES.SYNC_MESSAGE.stroke}
        />
      </marker>

      {/* Asynchronous Message Arrow */}
      <marker
        id="async-arrow"
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path
          d="M 0 0 L 10 5 L 0 10"
          fill="none"
          stroke={STYLES.ASYNC_MESSAGE.stroke}
          strokeWidth="1"
        />
      </marker>

      {/* Return Message Arrow */}
      <marker
        id="return-arrow"
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path
          d="M 0 0 L 10 5 L 0 10"
          fill="none"
          stroke={STYLES.RETURN_MESSAGE.stroke}
          strokeWidth="1"
          strokeDasharray="2"
        />
      </marker>
    </defs>
  );
};

export default ArrowMarkers;