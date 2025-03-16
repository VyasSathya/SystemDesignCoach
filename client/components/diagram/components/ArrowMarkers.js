import React from 'react';
import { CONSTANTS } from '../utils/sequenceDiagramConstants';

const ArrowMarkers = () => {
  return (
    <defs>
      {/* Synchronous Message Arrow */}
      <marker
        id={`${CONSTANTS.MESSAGE_TYPES.SYNC}-arrow`}
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path
          d="M 0 0 L 10 5 L 0 10 z"
          fill={CONSTANTS.STYLES.SYNC_MESSAGE.stroke}
        />
      </marker>

      {/* Asynchronous Message Arrow */}
      <marker
        id={`${CONSTANTS.MESSAGE_TYPES.ASYNC}-arrow`}
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
          stroke={CONSTANTS.STYLES.ASYNC_MESSAGE.stroke}
          strokeWidth="1"
        />
      </marker>

      {/* Return Message Arrow */}
      <marker
        id={`${CONSTANTS.MESSAGE_TYPES.RETURN}-arrow`}
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
          stroke={CONSTANTS.STYLES.RETURN_MESSAGE.stroke}
          strokeWidth="1"
          strokeDasharray="2"
        />
      </marker>
    </defs>
  );
};

export default ArrowMarkers;