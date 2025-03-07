import React, { useState, useEffect, useCallback } from 'react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import { X, Download, RefreshCw, MessageSquare, Code, Eye, Edit, Undo, Redo, Save } from 'lucide-react';
import { mermaidToReactFlow, reactFlowToMermaid } from './utils/conversion';
import MermaidRenderer from './MermaidRenderer';
import ReactFlowDiagramWithProvider from './ReactFlowDiagram';
import DiagramToolbar from './DiagramToolbar';

const DiagramPanel = ({
  sessionId,
  sessionType = 'coaching',
  initialDiagram = null,
  onClose,
  onSave,
  onRefresh,
  onAiSuggest
}) => {
  const [viewMode, setViewMode] = useState('edit');
  const [mermaidCode, setMermaidCode] = useState(initialDiagram?.mermaidCode || 'graph TD\n    Client[Client] --> API[API Gateway]\n    API --> Service[Service]\n    Service --> DB[(Database)]');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [customRequest, setCustomRequest] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize from mermaid code
  useEffect(() => {
    if (initialDiagram?.mermaidCode) {
      setMermaidCode(initialDiagram.mermaidCode);
      try {
        const { nodes: convertedNodes, edges: convertedEdges } = mermaidToReactFlow(initialDiagram.mermaidCode);
        setNodes(convertedNodes);
        setEdges(convertedEdges);
        setHistory([{ mermaidCode: initialDiagram.mermaidCode, nodes: convertedNodes, edges: convertedEdges }]);
        setHistoryIndex(0);
      } catch (err) {
        console.error('Error converting Mermaid to React Flow:', err);
        setError('Failed to initialize diagram editor');
      }
    } else {
      try {
        const { nodes: convertedNodes, edges: convertedEdges } = mermaidToReactFlow(mermaidCode);
        setNodes(convertedNodes);
        setEdges(convertedEdges);
        setHistory([{ mermaidCode, nodes: convertedNodes, edges: convertedEdges }]);
        setHistoryIndex(0);
      } catch (err) {
        console.error('Error setting up default diagram:', err);
      }
    }
  }, [initialDiagram]);

  // Track changes for history
  useEffect(() => {
    if (nodes.length === 0 && edges.length === 0) return;
    try {
      const newMermaidCode = reactFlowToMermaid({ nodes, edges });
      setMermaidCode(newMermaidCode);
      
      // Update history if needed
      if (history.length === 0 || newMermaidCode !== history[historyIndex]?.mermaidCode) {
        if (historyIndex < history.length - 1) {
          // Cut history at current point if we're in the middle
          const newHistory = history.slice(0, historyIndex + 1);
          newHistory.push({ 
            mermaidCode: newMermaidCode, 
            nodes: JSON.parse(JSON.stringify(nodes)), 
            edges: JSON.parse(JSON.stringify(edges)) 
          });
          setHistory(newHistory);
          setHistoryIndex(historyIndex + 1);
        } else {
          // Add to history at the end
          setHistory([...history, { 
            mermaidCode: newMermaidCode, 
            nodes: JSON.parse(JSON.stringify(nodes)), 
            edges: JSON.parse(JSON.stringify(edges)) 
          }]);
          setHistoryIndex(history.length);
        }
      }
    } catch (err) {
      console.error('Error converting React Flow to Mermaid:', err);
    }
  }, [nodes, edges, history, historyIndex]);

  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((connection) => {
    setEdges((eds) =>
      addEdge({ ...connection, id: `edge-${connection.source}-${connection.target}`, type: 'smoothstep' }, eds)
    );
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (onSave) {
        await onSave({ mermaidCode, reactFlowData: { nodes, edges } });
      }
      setError(null);
    } catch (err) {
      console.error('Error saving diagram:', err);
      setError('Failed to save diagram');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiSuggest = async (customPrompt = null) => {
    setIsLoading(true);
    try {
      if (onAiSuggest) {
        const suggestion = await onAiSuggest(mermaidCode, customPrompt);
        if (suggestion?.mermaidCode) {
          setMermaidCode(suggestion.mermaidCode);
          try {
            const { nodes: suggestedNodes, edges: suggestedEdges } = mermaidToReactFlow(suggestion.mermaidCode);
            setNodes(suggestedNodes);
            setEdges(suggestedEdges);
            // History will be updated by the effect above
          } catch (err) {
            console.error('Error converting suggested Mermaid to ReactFlow:', err);
          }
        }
      }
      setError(null);
      setShowCustomForm(false);
    } catch (err) {
      console.error('Error getting AI suggestions:', err);
      setError('Failed to get AI suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      setMermaidCode(previousState.mermaidCode);
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      setHistoryIndex(newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      setMermaidCode(nextState.mermaidCode);
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(newIndex);
    }
  };

  const handleDownload = () => {
    if (viewMode === 'preview') {
      const svgElement = document.querySelector('.mermaid svg');
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `system-diagram-${Date.now()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } else {
      const textBlob = new Blob([mermaidCode], { type: 'text/plain' });
      const url = URL.createObjectURL(textBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `system-diagram-${Date.now()}.mmd`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleCustomRequest = (e) => {
    e.preventDefault();
    if (!customRequest.trim()) return;
    handleAiSuggest(customRequest);
    setCustomRequest('');
  };

  const updateMermaidFromEditor = useCallback(() => {
    try {
      const { nodes: convertedNodes, edges: convertedEdges } = mermaidToReactFlow(mermaidCode);
      setNodes(convertedNodes);
      setEdges(convertedEdges);
      setViewMode('edit');
    } catch (err) {
      setError('Invalid Mermaid code: ' + err.message);
    }
  }, [mermaidCode]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h2 className="font-semibold text-gray-800">System Design Diagram</h2>
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button onClick={() => setViewMode('edit')} className={`px-3 py-1 text-sm ${viewMode === 'edit' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <Edit className="h-4 w-4 inline-block mr-1" />
              Edit
            </button>
            <button onClick={() => setViewMode('preview')} className={`px-3 py-1 text-sm ${viewMode === 'preview' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <Eye className="h-4 w-4 inline-block mr-1" />
              Preview
            </button>
            <button onClick={() => setViewMode('code')} className={`px-3 py-1 text-sm ${viewMode === 'code' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <Code className="h-4 w-4 inline-block mr-1" />
              Code
            </button>
          </div>
        </div>
        <div className="flex space-x-2">
          <button onClick={handleUndo} disabled={historyIndex <= 0} className={`p-2 rounded ${historyIndex > 0 ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300'}`} title="Undo">
            <Undo className="h-4 w-4" />
          </button>
          <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className={`p-2 rounded ${historyIndex < history.length - 1 ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300'}`} title="Redo">
            <Redo className="h-4 w-4" />
          </button>
          <button onClick={handleSave} className="p-2 rounded hover:bg-gray-100 text-gray-600" title="Save Diagram" disabled={isLoading}>
            <Save className={`h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`} />
          </button>
          <button onClick={handleDownload} className="p-2 rounded hover:bg-gray-100 text-gray-600" title="Download">
            <Download className="h-4 w-4" />
          </button>
          <button onClick={() => handleAiSuggest()} className="p-2 rounded hover:bg-gray-100 text-gray-600" title="Get AI Suggestions" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowCustomForm(!showCustomForm)} className="p-2 rounded hover:bg-gray-100 text-gray-600" title="Custom Request">
            <MessageSquare className="h-4 w-4" />
          </button>
          {onClose && (
            <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 text-gray-600" title="Close">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {showCustomForm && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleCustomRequest} className="flex">
            <input
              type="text"
              value={customRequest}
              onChange={(e) => setCustomRequest(e.target.value)}
              placeholder="Request specific diagram improvements..."
              className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Send'}
            </button>
          </form>
        </div>
      )}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'edit' && (
          <div className="h-full flex flex-col">
            <div className="flex-1">
              <ReactFlowDiagramWithProvider
                initialNodes={nodes}
                initialEdges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
              />
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <h3 className="text-sm font-medium mb-3">Add Components</h3>
              <DiagramToolbar />
            </div>
          </div>
        )}
        {viewMode === 'preview' && (
          <div className="h-full p-4 overflow-auto">
            <MermaidRenderer code={mermaidCode} onError={(errorMsg) => setError(errorMsg)} />
          </div>
        )}
        {viewMode === 'code' && (
          <div className="h-full p-4 flex flex-col">
            <textarea
              value={mermaidCode}
              onChange={(e) => setMermaidCode(e.target.value)}
              className="w-full flex-1 font-mono text-sm p-4 border border-gray-300 rounded"
              placeholder="Mermaid diagram code"
            />
            <div className="mt-4">
              <button
                onClick={updateMermaidFromEditor}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Apply Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagramPanel;