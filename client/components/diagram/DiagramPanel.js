import React, { useState, useCallback } from 'react';
import ReactFlow from 'reactflow';
import { Panel, Button, Tooltip } from '@mui/material';
import { Wand2, Save, RefreshCw, X } from 'lucide-react';

import { nodeTypes } from './NodeTypes/SequenceDiagramNodeTypes';
import MermaidRenderer from './MermaidRenderer';
import DiagramToolbar from './DiagramToolbar';

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
  const [nodes, setNodes] = useState(initialDiagram?.nodes || []);
  const [edges, setEdges] = useState(initialDiagram?.edges || []);
  const [mode, setMode] = useState('edit'); // edit, preview, mermaid
  const [loading, setLoading] = useState(false);

  const handleCustomRequest = useCallback(async (e) => {
    setLoading(true);
    try {
      const result = await onAiSuggest(nodes, edges);
      // Handle AI suggestions
      if (result.proposedChanges) {
        setNodes(result.proposedChanges.nodes);
        setEdges(result.proposedChanges.edges);
      }
    } catch (error) {
      console.error('AI suggestion error:', error);
    }
    setLoading(false);
  }, [nodes, edges, onAiSuggest]);

  const onDragStart = useCallback((event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleInsertNode = useCallback((type) => {
    const position = {
      x: Math.random() * window.innerWidth * 0.5,
      y: Math.random() * window.innerHeight * 0.5,
    };
    createNode(type, position);
  }, []);

  const getSaveButtonUI = () => (
    <div className="flex gap-2">
      <Button
        variant="contained"
        color="primary"
        onClick={() => onSave(nodes, edges)}
        startIcon={<Save />}
      >
        Save
      </Button>
      {onSaveAndContinue && (
        <Button
          variant="contained"
          color="secondary"
          onClick={() => onSaveAndContinue(nodes, edges)}
        >
          Save & Continue
        </Button>
      )}
    </div>
  );

  const createNode = useCallback((type, position, data = {}) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: { label: `New ${type}`, ...data },
    };
    setNodes((nds) => [...nds, newNode]);
    return newNode;
  }, []);

  const handleAddNode = useCallback((type, position) => {
    createNode(type, position);
  }, [createNode]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <DiagramToolbar
          mode={mode}
          setMode={setMode}
          onAddNode={handleAddNode}
          hideModes={hideModes}
        />
        <div className="flex gap-2">
          <Tooltip title="AI Suggestions">
            <Button
              variant="outlined"
              onClick={handleCustomRequest}
              disabled={loading}
              startIcon={<Wand2 />}
            >
              Suggest Improvements
            </Button>
          </Tooltip>
          {onRefresh && (
            <Button
              variant="outlined"
              onClick={onRefresh}
              startIcon={<RefreshCw />}
            >
              Refresh
            </Button>
          )}
          {getSaveButtonUI()}
          {onClose && (
            <Button
              variant="outlined"
              color="error"
              onClick={onClose}
              startIcon={<X />}
            >
              Close
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 relative">
        {mode === 'mermaid' ? (
          <MermaidRenderer nodes={nodes} edges={edges} />
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
            nodeTypes={nodeTypes}
            fitView
          >
            <Panel position="top-left">
              <div className="bg-white p-2 rounded shadow">
                Drag nodes to reposition
              </div>
            </Panel>
          </ReactFlow>
        )}
      </div>
    </div>
  );
};

export default DiagramPanel;