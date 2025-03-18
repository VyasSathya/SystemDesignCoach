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
import { Trash2, Edit, MessageSquare, Save } from 'lucide-react';
import NodePalette from './NodePalette';
import CustomNode from './NodeTypes/CustomNode';
import 'reactflow/dist/style.css';

const SystemArchitectureDiagram = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [nodeName, setNodeName] = useState('');
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [pendingNodeType, setPendingNodeType] = useState(null);
  const [newNodeName, setNewNodeName] = useState('');
  const [nodeData, setNodeData] = useState(null);

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
    setPendingNodeType(nodeData.data.nodeType);
    setNewNodeName(nodeData.data.nodeType);
    // Store the style information
    setNodeData(nodeData.data);
    setShowNameDialog(true);
  }, []);

  const handleCreateNamedNode = useCallback(() => {
    if (!newNodeName.trim() || !pendingNodeType || !nodeData) return;

    const position = { x: 100, y: 100 };
    const newNode = {
      id: `${pendingNodeType}_${Date.now()}`,
      type: 'custom',
      position,
      data: {
        ...nodeData,  // Spread all the original node data
        nodeType: pendingNodeType,
        label: newNodeName.trim(),
        isConnectable: true,
        sourcePosition: 'right',
        targetPosition: 'left',
      },
      draggable: true,
      connectable: true,
    };

    setNodes((nds) => [...nds, newNode]);
    setShowNameDialog(false);
    setPendingNodeType(null);
    setNewNodeName('');
    setNodeData(null);
  }, [pendingNodeType, newNodeName, nodeData]);

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

  const onSaveAndContinue = async () => {
    try {
      const diagramData = {
        nodes,
        edges
      };
      console.log('Saving diagram:', diagramData);
      // Here you would typically make an API call to save the data
      console.log('Diagram saved successfully');
    } catch (error) {
      console.error('Error saving diagram:', error);
    }
  };

  return (
    <div style={{ width: '100%', height: '77vh' }} className="relative">  {/* Changed from 80vh to 75vh */}
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
          <Panel position="top-right" className="bg-white p-2 rounded shadow-lg">
            {selectedNode && (
              <div className="flex gap-2">
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nodeName}
                      onChange={(e) => setNodeName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveNodeName();
                        }
                      }}
                      className="border px-2 py-1 rounded"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveNodeName}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      <Edit className="w-4 h-4" />
                      Rename
                    </button>
                    <button
                      onClick={handleDeleteSelected}
                      className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </Panel>

          {/* Node name editor Panel removed as it's now integrated above */}
        </ReactFlow>
        <NodePalette onNodeAdd={handleAddNode} />
      </ReactFlowProvider>

      {/* Name Input Dialog */}
      {showNameDialog && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium mb-4">Enter participant name</h3>
            <input
              type="text"
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateNamedNode();
                }
              }}
              className="border px-3 py-2 rounded w-full mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowNameDialog(false);
                  setPendingNodeType(null);
                  setNewNodeName('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNamedNode}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white border-t border-gray-200 p-4 flex justify-between items-center shadow-md">
        <button className="flex items-center px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors">
          <MessageSquare size={16} className="mr-2" />
          Ask Coach
        </button>
        <button 
          onClick={onSaveAndContinue}
          className="flex items-center px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Save size={16} className="mr-2" />
          Save & Continue
        </button>
      </div>
    </div>
  );
};

export default SystemArchitectureDiagram;
