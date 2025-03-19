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
import { useWorkbook } from '../../context/WorkbookContext';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const SystemArchitectureDiagram = ({ onSave, initialData, sessionId }) => {
  const { user } = useAuth();
  const { state, dispatch, workbookService } = useWorkbook();
  const { currentProblem, problems } = state;

  console.log('Initial state:', {
    currentProblem,
    existingData: problems[currentProblem]?.sections?.architecture
  });

  // Initialize state using initialData or defaults
  const [nodes, setNodes] = useState(() => {
    const savedState = localStorage.getItem('currentArchitectureDiagramState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return parsed.nodes || [];
    }
    return initialData?.nodes || [];
  });

  const [edges, setEdges] = useState(() => {
    const savedState = localStorage.getItem('currentArchitectureDiagramState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return parsed.edges || [];
    }
    return initialData?.edges || [];
  });

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

  // Centralized save function following the data model pattern
  const saveData = async (diagramData) => {
    console.log('Saving diagram data:', diagramData);
    
    if (!currentProblem) {
      console.error('No currentProblem available');
      return;
    }

    // Get the current section data
    const currentSectionData = problems[currentProblem]?.sections?.architecture || {};
    
    // Prepare the updated section data
    const updatedSectionData = {
      ...currentSectionData,
      diagram: diagramData
    };

    console.log('Dispatching update with:', {
      problemId: currentProblem,
      section: 'architecture',
      data: updatedSectionData
    });

    // Update local state through Context
    dispatch({
      type: 'UPDATE_SECTION_DATA',
      problemId: currentProblem,
      section: 'architecture',
      data: updatedSectionData
    });

    // Persist to backend
    try {
      const payload = {
        sections: {
          architecture: updatedSectionData
        }
      };
      
      console.log('Saving to backend:', payload);
      
      await workbookService.saveAllData(
        currentProblem,
        'architecture',
        payload
      );

      console.log('Save successful');
    } catch (error) {
      console.error('Failed to save:', error);
      throw error; // Re-throw to handle in the calling function
    }
  };

  // Auto-save effect with debounce
  useEffect(() => {
    if (!currentProblem || !nodes || !edges) return;

    const timeoutId = setTimeout(() => {
      console.log('Auto-save triggered');
      const diagramData = {
        nodes,
        edges
      };
      saveData(diagramData).catch(console.error);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, currentProblem]);

  const onNodesChange = useCallback((changes) => {
    console.log('Nodes changed:', changes);
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes) => {
    console.log('Edges changed:', changes);
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

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
    if (!currentProblem) {
      toast({
        title: "Error",
        description: "Missing problem information",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      console.log('Manual save triggered');
      const diagramData = {
        nodes,
        edges
      };
      
      await saveData(diagramData);
      
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

  // Persistence effect
  useEffect(() => {
    if (!user?.id || !sessionId) return;
    
    const state = {
      nodes,
      edges
    };
    workbookService.saveDiagram(user.id, sessionId, state, 'architecture');
  }, [nodes, edges, user?.id, sessionId]);

  // Save state whenever nodes or edges change
  useEffect(() => {
    const state = {
      nodes,
      edges
    };
    
    // Save to localStorage
    localStorage.setItem('currentArchitectureDiagramState', JSON.stringify(state));
    
    // Call onSave prop if provided
    if (onSave) {
      onSave(state);
    }
  }, [nodes, edges, onSave]);

  return (
    <div className="h-full flex flex-col">
      {/* ReactFlow container */}
      <div className="flex-1 relative">
        <ReactFlowProvider>
          <div className="h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={memoizedNodeTypes}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </div>

      {/* Node Palette */}
      <NodePalette onNodeAdd={handleAddNode} />

      {/* Bottom control bar */}
      <div className="flex justify-between items-center bg-white border-t border-gray-200 p-4">
        <button 
          className="flex items-center px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
        >
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

      {showNameDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4">
            <input
              type="text"
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
              className="border p-2 rounded"
              placeholder="Enter name"
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowNameDialog(false);
                  setPendingNodeType(null);
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
    </div>
  );
};

// Wrapper with Provider
const SystemArchitectureDiagramWrapper = () => {
  return (
    <ReactFlowProvider>
      <SystemArchitectureDiagram />
    </ReactFlowProvider>
  );
};

export default SystemArchitectureDiagramWrapper;
