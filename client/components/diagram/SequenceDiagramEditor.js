import React, { useCallback, useState } from 'react';
import ReactFlow, { useReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Panel } from 'reactflow';
import { sequenceDiagramNodeTypes } from './NodeTypes/SequenceDiagramNodeTypes';
import { Trash2, Edit } from 'lucide-react';

export const SequenceDiagramEditor = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLabel, setEditingLabel] = useState('');
  const { getViewport, project } = useReactFlow();

  // Add node click handler
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setEditingLabel(node.data.label);
  }, []);

  const handleAddNode = useCallback((type) => {
    const viewport = getViewport();
    const position = project({ 
      x: viewport.width / 2, 
      y: viewport.height / 2 
    });
    
    const newNode = {
      id: `${type}_${Date.now()}`,
      type,
      position,
      data: {
        label: `New ${type}`,
        type,
        isConnectable: true
      },
      draggable: true,
      connectable: true
    };
    
    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
    setEditingLabel(`New ${type}`);
    setIsEditing(true);
  }, [getViewport, project]);

  const handleSaveNodeName = useCallback(() => {
    if (!selectedNode || !editingLabel.trim()) return;
    
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, label: editingLabel.trim() } }
          : node
      )
    );
    setIsEditing(false);
  }, [selectedNode, editingLabel]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    setEdges((eds) => eds.filter(
      (edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id
    ));
    setSelectedNode(null);
    setIsEditing(false);
  }, [selectedNode]);

  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={sequenceDiagramNodeTypes}
        fitView
      >
        <Panel position="top-right" className="bg-white p-2 rounded shadow-lg">
          <button
            onClick={() => handleAddNode('participant')}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
          >
            Add Participant
          </button>

          {selectedNode && (
            <div className="flex gap-2">
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    onKeyDown={(e) => {
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
                    onClick={() => {
                      setEditingLabel(selectedNode.data.label);
                      setIsEditing(true);
                    }}
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
      </ReactFlow>
    </div>
  );
};