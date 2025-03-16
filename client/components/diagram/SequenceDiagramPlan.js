/**
 * Sequence Diagram Implementation Plan
 * -----------------------------------
 * This is a temporary file to track implementation strategy.
 * Delete after implementation is complete.
 */

/**
 * 1. NODE TYPES
 */
const NODE_TYPES = {
  user: 'ActorNode',      // Users icon, blue
  system: 'ParticipantNode',  // Server icon, green
  database: 'ParticipantNode',  // Database icon, purple
  lifeline: 'LifelineNode',  // Vertical line
  note: 'NoteNode',
  gate: 'GateNode',
  fragment: 'FragmentNode'  // Loop/alt containers
};

/**
 * 2. EDGE TYPES
 */
const EDGE_TYPES = {
  sync: 'SyncEdge',    // Solid arrow, filled head
  async: 'AsyncEdge',  // Dashed arrow, open head
  return: 'ReturnEdge' // Dotted line, open arrow
};

/**
 * 3. IMPLEMENTATION STEPS
 */

/* A. Node Creation System
--------------------------
1. Menu participant click:
   - Create participant node
   - Create attached lifeline
   - Set icon and color
   - Maintain spacing

2. Auto-position:
   - Calculate x based on existing
   - Fixed y for participants
   - Extend lifelines to canvas height
*/

/* B. Message Connection System
------------------------------
1. Edge Creation Rules:
   - Connect between lifelines only
   - Maintain message order
   - Auto-route
   - Style based on messageType

2. Edge Styling:
   - Sync: Solid, filled
   - Async: Dashed, open
   - Return: Dotted, open
*/

/**
 * 4. REQUIRED STATE
 */
const INITIAL_STATE = {
  nodes: [],
  edges: [],
  messageType: 'sync',
  selectedNode: null,
  canvasHeight: 800
};

/**
 * 5. CORE FUNCTIONS NEEDED
 */
const CORE_FUNCTIONS = {
  handleAddParticipant: 'type => void',
  handleConnect: 'params => void',
  handleNodeDrag: '(event, node) => void',
  handleCanvasResize: '() => void'
};

/**
 * 6. IMPLEMENTATION ORDER
 * 
 * 1. Basic Node Creation
 * 2. Message Connections
 * 3. Advanced Features
 */

/**
 * 7. REQUIRED COMPONENTS
 */
const COMPONENTS = {
  nodes: [
    'ActorNode',
    'ParticipantNode',
    'LifelineNode',
    'FragmentNode',
    'NoteNode',
    'GateNode'
  ],
  edges: [
    'SyncArrowEdge',
    'AsyncArrowEdge',
    'ReturnEdge'
  ],
  utils: [
    'calculateNodePosition',
    'updateLifelinePositions',
    'validateConnection',
    'updateEdgeStyle'
  ]
};

/**
 * STYLING CONSTANTS
 */
const STYLE_CONSTANTS = {
  colors: {
    user: '#3B82F6',    // blue-500
    system: '#10B981',  // green-500
    database: '#8B5CF6' // purple-500
  },
  spacing: {
    horizontalGap: 150,
    topMargin: 50,
    lifelineExtension: 1000
  }
};

// Export for reference
export {
  NODE_TYPES,
  EDGE_TYPES,
  INITIAL_STATE,
  CORE_FUNCTIONS,
  COMPONENTS,
  STYLE_CONSTANTS
};