import React, { useCallback, useState, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Panel,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges
} from 'reactflow';
import { Trash2, Edit } from 'lucide-react';
import NodePalette from './NodePalette';
import CustomNode from './NodeTypes/CustomNode';
import 'reactflow/dist/style.css';

const SystemArchitectureDiagram = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [nodeName, setNodeName] = useState('');

  // Memoize nodeTypes
  const nodeTypes = useMemo(() => ({
    custom: CustomNode
  }), []);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) => {
      const edge = {
        ...params,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#999', strokeWidth: 2 },
        deletable: true,
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    []
  );

  const handleDeleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter(
        (edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      setSelectedNode(null);
    }
  }, [selectedNode]);

  const handleAddNode = useCallback((nodeData) => {
    console.log('Adding new node:', nodeData);
    const position = { x: 100, y: 100 };
    const newNode = {
      id: `${nodeData.data.nodeType}_${Date.now()}`,
      type: 'custom',
      position,
      data: {
        ...nodeData.data,
        label: nodeData.data.nodeType,
        isConnectable: true,
        sourcePosition: 'right',
        targetPosition: 'left',
      },
      draggable: true,
      connectable: true,
    };
    console.log('New node created:', newNode);
    setNodes((nds) => {
      console.log('Current nodes:', nds);
      return [...nds, newNode];
    });
    setSelectedNode(newNode);
    setNodeName(nodeData.data.nodeType);
    setIsEditing(true);
  }, []);

  const handleSaveNodeName = useCallback(() => {
    if (!selectedNode) return;
    
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: nodeName
            }
          };
        }
        return node;
      })
    );
    setIsEditing(false);
  }, [selectedNode, nodeName]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setNodeName(node.data.label);
  }, []);

  return (
    <div className="h-full w-full relative">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid={true}
          snapGrid={[15, 15]}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#999', strokeWidth: 2 }
          }}
          className="h-full w-full"
        >
          <Background />
          <Controls />
          
          {/* Node controls panel */}
          {selectedNode && (
            <Panel position="top-right" className="flex gap-2 p-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md shadow-sm"
              >
                <Edit className="w-4 h-4" />
                Rename
              </button>
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </Panel>
          )}

          {/* Node name editor */}
          {isEditing && selectedNode && (
            <Panel position="top-center" className="bg-white p-4 rounded-lg shadow-lg">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">Node Name</label>
                <input
                  type="text"
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  className="border rounded px-2 py-1"
                  autoFocus
                />
                <div className="flex gap-2 justify-end mt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNodeName}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            </Panel>
          )}
        </ReactFlow>
        <NodePalette onNodeAdd={handleAddNode} />
      </ReactFlowProvider>
    </div>
  );
};

export default SystemArchitectureDiagram;
