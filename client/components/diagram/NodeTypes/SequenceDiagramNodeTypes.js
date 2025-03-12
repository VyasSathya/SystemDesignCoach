// client/components/diagram/NodeTypes/SequenceDiagramNodeTypes.js
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { User, Server, AlertTriangle, AlignLeft, Layers } from 'lucide-react';

/**
 * Actor Node - Represents a human participant in the sequence diagram
 */
export const ActorNode = memo(({ data, selected }) => (
  <div 
    className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-700' : 'border-blue-500'}`}
  >
    <div className="flex flex-col items-center">
      <User className="h-8 w-8 text-blue-500 mb-2" />
      <div className="text-sm font-bold text-center">{data.label}</div>
    </div>
    <Handle
      type="source"
      position={Position.Bottom}
      id="bottom"
      isConnectable={false}
      className="w-3 h-3 bg-blue-500"
    />
  </div>
));

/**
 * Participant Node - Represents a system or component in the sequence diagram
 */
export const ParticipantNode = memo(({ data, selected }) => (
  <div 
    className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-purple-700' : 'border-purple-500'}`}
  >
    <div className="flex flex-col items-center">
      <Server className="h-8 w-8 text-purple-500 mb-2" />
      <div className="text-sm font-bold text-center">{data.label}</div>
    </div>
    <Handle
      type="source"
      position={Position.Bottom}
      id="bottom"
      isConnectable={false}
      className="w-3 h-3 bg-purple-500"
    />
  </div>
));

/**
 * Lifeline Node - Represents the timeline of a participant in the sequence diagram
 */
export const LifelineNode = memo(({ data, selected }) => (
  <div 
    className={`sequence-lifeline-node ${selected ? 'border-l-2 border-gray-500' : ''}`} 
    style={{ width: '2px', height: data.height || 400 }}
  >
    <div className="w-1 h-full bg-gray-400 mx-auto"></div>
    <Handle
      type="target"
      position={Position.Top}
      id="top"
      isConnectable={false}
      style={{ visibility: 'hidden' }}
      className="w-3 h-3 bg-gray-500"
    />
    
    {/* Render activation boxes */}
    {data.activations && data.activations.map((activation, index) => (
      <div 
        key={index}
        className={`bg-${activation.color || 'blue'}-200 border border-${activation.color || 'blue'}-400`}
        style={{
          position: 'absolute',
          width: '10px',
          height: `${activation.height}px`,
          left: '-4px',
          top: `${activation.top}px`,
          zIndex: activation.nestLevel || 1
        }}
      />
    ))}
    
    <Handle
      type="source"
      position={Position.Right}
      id="right"
      className="w-3 h-3 bg-gray-500"
      style={{ right: '-6px', top: '50%' }}
      isConnectable={true}
    />
    <Handle
      type="target"
      position={Position.Left}
      id="left"
      className="w-3 h-3 bg-gray-500"
      style={{ left: '-6px', top: '50%' }}
      isConnectable={true}
    />
  </div>
));

/**
 * Combined Fragment Node - Represents logical groupings like alt, opt, loop, etc.
 */
export const CombinedFragmentNode = memo(({ data, selected }) => (
  <div 
    className={`px-2 py-1 border-2 ${selected ? 'border-gray-600' : 'border-gray-400'} bg-gray-50 bg-opacity-70 rounded-md`}
    style={{ width: data.width || 300, height: data.height || 120 }}
  >
    <div className="text-xs font-bold border-b border-gray-400 pb-1 mb-2 flex justify-between">
      <span>{data.fragmentType || 'opt'}</span>
      {data.condition && <span className="text-gray-600">[{data.condition}]</span>}
    </div>
    <div className="text-xs text-gray-600">{data.label || 'Fragment content'}</div>
    
    <Handle
      type="source"
      position={Position.Right}
      id="right"
      className="w-3 h-3 bg-gray-500"
    />
    <Handle
      type="target"
      position={Position.Left}
      id="left"
      className="w-3 h-3 bg-gray-500"
    />
    <Handle
      type="source"
      position={Position.Bottom}
      id="bottom"
      className="w-3 h-3 bg-gray-500"
    />
    <Handle
      type="target"
      position={Position.Top}
      id="top"
      className="w-3 h-3 bg-gray-500"
    />
  </div>
));

/**
 * Note Node - Represents a comment or note in the sequence diagram
 */
export const NoteNode = memo(({ data, selected }) => (
  <div 
    className={`px-2 py-1 bg-yellow-100 border-2 ${selected ? 'border-yellow-600' : 'border-yellow-400'} rounded-md shadow-sm`}
    style={{ maxWidth: '150px' }}
  >
    <div className="flex items-center mb-1">
      <AlignLeft className="h-3 w-3 text-yellow-700 mr-1" />
      <div className="text-xs font-medium text-yellow-700">Note</div>
    </div>
    <div className="text-xs">{data.label || 'Note text'}</div>
    
    <Handle
      type="source"
      position={Position.Right}
      id="right"
      className="w-3 h-3 bg-yellow-500"
    />
    <Handle
      type="target"
      position={Position.Left}
      id="left"
      className="w-3 h-3 bg-yellow-500"
    />
  </div>
));

/**
 * Gate Node - Represents a message to/from outside the diagram
 */
export const GateNode = memo(({ data, selected }) => (
  <div 
    className={`px-2 py-2 bg-gray-100 border-2 ${selected ? 'border-gray-600' : 'border-gray-400'} rounded-md shadow-sm`}
  >
    <div className="flex items-center justify-center">
      <AlertTriangle className="h-4 w-4 text-gray-600" />
    </div>
    <div className="text-xs text-center mt-1">{data.label || 'Gate'}</div>
    
    <Handle
      type="source"
      position={Position.Right}
      id="right"
      className="w-3 h-3 bg-gray-500"
    />
    <Handle
      type="target"
      position={Position.Left}
      id="left"
      className="w-3 h-3 bg-gray-500"
    />
  </div>
));

// Message types for edges
export const MessageTypes = {
  SYNC: 'sync',
  ASYNC: 'async',
  RETURN: 'return',
  CREATE: 'create',
  DESTROY: 'destroy',
  FOUND: 'found',
  LOST: 'lost'
};

// Fragment types
export const FragmentTypes = {
  ALT: 'alt',
  OPT: 'opt',
  LOOP: 'loop',
  BREAK: 'break',
  PAR: 'par',
  CRITICAL: 'critical',
  NEG: 'neg',
  REF: 'ref'
};

// Export all node types as a collection for easy import
export const sequenceDiagramNodeTypes = {
  actor: ActorNode,
  participant: ParticipantNode,
  lifeline: LifelineNode,
  fragment: CombinedFragmentNode,
  note: NoteNode,
  gate: GateNode
};