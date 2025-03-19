import React, { useCallback, useState, useMemo, useEffect } from 'react';
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
import BaseNode from './NodeTypes/BaseNode';
import 'reactflow/dist/style.css';
import { workbookService } from '../../services/workbookService';
import { toast } from 'react-toastify';

const SystemArchitectureDiagram = ({ userId, problemId }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeName, setNodeName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [pendingNodeType, setPendingNodeType] = useState(null);
  const [newNodeName, setNewNodeName] = useState('');
  const [nodeData, setNodeData] = useState(null);

  // Memoize node types
  const memoizedNodeTypes = useMemo(() => ({
    custom: CustomNode,
    user: BaseNode,
    system: BaseNode,
    database: BaseNode
  }), []);

  // Create a memoized storage key
  const storageKey = useMemo(() => 
    `system_diagram_${userId}_${problemId}`,
    [userId, problemId]
  );

  // Load diagram data on mount
  useEffect(() => {
    const loadDiagram = async () => {
      try {
        // Try loading from backend first
        const saved = await workbookService.getDiagram(userId, problemId, 'system');
        if (saved?.nodes) {
          setNodes(saved.nodes);
          setEdges(saved.edges || []);
          return;
        }

        // Fall back to localStorage if backend fails
        const localData = localStorage.getItem(storageKey);
        if (localData) {
          const parsed = JSON.parse(localData);
          setNodes(parsed.nodes || []);
          setEdges(parsed.edges || []);
        }
      } catch (err) {
        console.error('Failed to load diagram:', err);
        // Try localStorage as fallback
        const localData = localStorage.getItem(storageKey);
        if (localData) {
          const parsed = JSON.parse(localData);
          setNodes(parsed.nodes || []);
          setEdges(parsed.edges || []);
        }
      }
    };
    
    if (userId && problemId) {
      loadDiagram();
    }
  }, [userId, problemId, storageKey]);

  // Save whenever diagram changes
  useEffect(() => {
    const saveDiagram = async () => {
      try {
        if (!userId || !problemId) return;
        
        const diagramData = {
          nodes,
          edges
        };
        
        // Save to localStorage first
        localStorage.setItem(storageKey, JSON.stringify(diagramData));
        
        // Then save to backend
        await workbookService.saveDiagram(userId, problemId, diagramData, 'system');
      } catch (err) {
        console.error('Failed to save diagram:', err);
      }
    };

    // Debounce save to avoid too many saves
    const timeoutId = setTimeout(saveDiagram, 1000);
    return () => clearTimeout(timeoutId);
  }, [nodes, edges, userId, problemId, storageKey]);

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
      
      // Save to localStorage
      localStorage.setItem(storageKey, JSON.stringify(diagramData));
      
      // Save to backend
      await workbookService.saveDiagram(userId, problemId, diagramData, 'system');
      
      toast({
        title: "Success",
        description: "Diagram saved successfully",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error saving diagram:', error);
      toast({
        title: "Error",
        description: "Failed to save diagram",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Add persistence effect
  useEffect(() => {
    // Add console log to debug props
    console.log('Component props:', { userId, problemId });
    const state = {
      nodes,
      edges
    };
    if (userId && problemId) {  // Only save if we have both values
      workbookService.saveDiagram(userId, problemId, state, 'system')
        .catch(error => console.error('Failed to save diagram:', error));
    }
  }, [nodes, edges, userId, problemId]);

  return (
    <div className="flex flex-col h-full">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={memoizedNodeTypes}
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
