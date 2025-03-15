import React, { useState, useEffect, useCallback } from 'react';
import SystemArchitectureDiagram from './SystemArchitectureDiagram';
import { CircularProgress } from '@mui/material';
import { Wand2, Save, RefreshCw, X } from 'lucide-react';

const DiagramPanel = ({
  hideModes = false,
  sessionId,
  sessionType = 'coaching',
  initialDiagram = null,
  onClose,
  onSave,
  onRefresh,
  onAiSuggest,
  onSaveAndContinue,
}) => {
  // Initialize with default nodes if no initial diagram
  const [nodes, setNodes] = useState([
    {
      id: '1',
      type: 'service',
      position: { x: 250, y: 100 },
      data: { label: 'API Service', notes: 'Main service' }
    },
    {
      id: '2',
      type: 'database',
      position: { x: 250, y: 250 },
      data: { label: 'Database', notes: 'Primary storage' }
    }
  ]);
  
  const [edges, setEdges] = useState([
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'default'
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialDiagram) {
      setNodes(initialDiagram.nodes || []);
      setEdges(initialDiagram.edges || []);
    }
  }, [initialDiagram]);

  const handleNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const handleEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const handleConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex justify-between items-center p-2 border-b">
        <div className="flex space-x-2">
          <button
            onClick={onAiSuggest}
            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 flex items-center"
          >
            <Wand2 className="w-4 h-4 mr-1" />
            Ask Coach
          </button>
          <button
            onClick={() => onSave({ nodes, edges })}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </button>
          <button
            onClick={onRefresh}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Diagram Area */}
      <div className="flex-1 min-h-[500px]">
        <SystemArchitectureDiagram
          initialNodes={nodes}
          initialEdges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
        />
      </div>
    </div>
  );
};

export default DiagramPanel;