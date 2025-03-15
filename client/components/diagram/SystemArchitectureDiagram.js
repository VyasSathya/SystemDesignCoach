import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Panel,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges
} from 'reactflow';
import { Trash2 } from 'lucide-react';
import NodePalette from './NodePalette';
import CustomNode from './NodeTypes/CustomNode';
import 'reactflow/dist/style.css';

const nodeTypes = {
  custom: CustomNode
};

const SystemArchitectureDiagram = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodeEditor, setShowNodeEditor] = useState(false);
  const [nodeToEdit, setNodeToEdit] = useState(null);
  const [nodeName, setNodeName] = useState('');

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
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
    const position = { x: 100, y: 100 };
    const newNode = {
      id: `${nodeData.type}_${Date.now()}`,
      type: 'custom',
      position,
      data: {
        ...nodeData.data,
        label: '', // This will be set via the popup
      },
    };
    
    setNodeToEdit(newNode);
    setShowNodeEditor(true);
  }, []);

  const handleNodeNameSubmit = useCallback(() => {
    if (!nodeToEdit || !nodeName.trim()) return;
    
    const newNode = {
      ...nodeToEdit,
      data: {
        ...nodeToEdit.data,
        label: nodeName.trim(),
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    setShowNodeEditor(false);
    setNodeToEdit(null);
    setNodeName('');
  }, [nodeToEdit, nodeName]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="h-full w-full flex">
      {/* NodePalette */}
      <div className="w-48 border-r border-gray-200">
        <NodePalette onNodeAdd={handleAddNode} />
      </div>

      {/* Main diagram area - simplified container structure */}
      <div className="flex-1 h-full relative">
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
            className="h-full w-full"
          >
            <Background />
            <Controls />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {/* Node Editor Modal */}
      {showNodeEditor && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium mb-4">Name your node</h3>
            <input
              type="text"
              className="border rounded px-2 py-1 w-full mb-4"
              placeholder="Enter node name"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleNodeNameSubmit();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => {
                  setShowNodeEditor(false);
                  setNodeToEdit(null);
                  setNodeName('');
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleNodeNameSubmit}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemArchitectureDiagram;
