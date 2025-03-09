// client/components/diagram/DiagramPanel.js
import React, { useState, useEffect, useCallback } from 'react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import { X, Download, RefreshCw, MessageSquare, Code, Eye, Edit, Undo, Redo, Save, 
         Database, Server, Globe, Archive, Grid, Share2, Box } from 'lucide-react';
import { mermaidToReactFlow, reactFlowToMermaid } from './utils/conversion';
import dynamic from 'next/dynamic';

// Use dynamic imports for browser-only components
const MermaidRenderer = dynamic(() => import('./MermaidRenderer'), { ssr: false });
const ReactFlowDiagramWithProvider = dynamic(() => import('./ReactFlowDiagram'), { ssr: false });

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
  const [mermaidCode, setMermaidCode] = useState(
    initialDiagram?.mermaidCode || 
    'graph TD\n    Client[Client] --> API[API Gateway]\n    API --> Service[Service]\n    Service --> DB[(Database)]'
  );
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [customRequest, setCustomRequest] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize from mermaid code when initialDiagram changes
  useEffect(() => {
    if (!initialDiagram) return;
    
    try {
      const code = initialDiagram.mermaidCode;
      setMermaidCode(code);
      const { nodes: convertedNodes, edges: convertedEdges } = mermaidToReactFlow(code);
      setNodes(convertedNodes);
      setEdges(convertedEdges);
      
      // Reset history
      setHistory([{ 
        mermaidCode: code, 
        nodes: convertedNodes, 
        edges: convertedEdges 
      }]);
      setHistoryIndex(0);
      setError(null);
    } catch (err) {
      console.error('Error converting Mermaid to React Flow:', err);
      setError('Failed to initialize diagram: ' + err.message);
    }
  }, [initialDiagram]);

  // Initialize default diagram if none provided
  useEffect(() => {
    if (nodes.length === 0 && edges.length === 0 && mermaidCode) {
      try {
        const { nodes: convertedNodes, edges: convertedEdges } = mermaidToReactFlow(mermaidCode);
        setNodes(convertedNodes);
        setEdges(convertedEdges);
        
        if (history.length === 0) {
          setHistory([{ 
            mermaidCode, 
            nodes: convertedNodes, 
            edges: convertedEdges 
          }]);
          setHistoryIndex(0);
        }
      } catch (err) {
        console.error('Error initializing diagram:', err);
      }
    }
  }, [mermaidCode, nodes.length, edges.length, history.length]);

  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => {
      const updatedNodes = applyNodeChanges(changes, nds);
      
      // Update mermaid code on significant changes
      if (changes.some(change => change.type !== 'select' && change.type !== 'position')) {
        try {
          const newMermaidCode = reactFlowToMermaid({ 
            nodes: updatedNodes, 
            edges 
          });
          setMermaidCode(newMermaidCode);
          
          // Add to history if this is a meaningful change
          const newState = { 
            mermaidCode: newMermaidCode,
            nodes: JSON.parse(JSON.stringify(updatedNodes)),
            edges: JSON.parse(JSON.stringify(edges))
          };
          
          // Cut history at current index if we're not at the end
          if (historyIndex < history.length - 1) {
            setHistory([...history.slice(0, historyIndex + 1), newState]);
            setHistoryIndex(historyIndex + 1);
          } else {
            setHistory([...history, newState]);
            setHistoryIndex(history.length);
          }
        } catch (err) {
          console.error('Error updating Mermaid from nodes:', err);
        }
      }
      
      return updatedNodes;
    });
  }, [edges, history, historyIndex]);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => {
      const updatedEdges = applyEdgeChanges(changes, eds);
      
      // Update mermaid code when edges change
      if (changes.length > 0) {
        try {
          const newMermaidCode = reactFlowToMermaid({ 
            nodes, 
            edges: updatedEdges 
          });
          setMermaidCode(newMermaidCode);
          
          // Add to history
          const newState = { 
            mermaidCode: newMermaidCode,
            nodes: JSON.parse(JSON.stringify(nodes)),
            edges: JSON.parse(JSON.stringify(updatedEdges))
          };
          
          if (historyIndex < history.length - 1) {
            setHistory([...history.slice(0, historyIndex + 1), newState]);
            setHistoryIndex(historyIndex + 1);
          } else {
            setHistory([...history, newState]);
            setHistoryIndex(history.length);
          }
        } catch (err) {
          console.error('Error updating Mermaid from edges:', err);
        }
      }
      
      return updatedEdges;
    });
  }, [nodes, history, historyIndex]);

  const onConnect = useCallback((connection) => {
    const newEdge = {
      ...connection, 
      id: `edge-${connection.source}-${connection.target}`, 
      type: 'smoothstep'
    };
    
    setEdges((eds) => {
      const updatedEdges = addEdge(newEdge, eds);
      
      // Update mermaid code when a connection is made
      try {
        const newMermaidCode = reactFlowToMermaid({ 
          nodes, 
          edges: updatedEdges 
        });
        setMermaidCode(newMermaidCode);
        
        // Add to history
        const newState = { 
          mermaidCode: newMermaidCode,
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(updatedEdges))
        };
        
        if (historyIndex < history.length - 1) {
          setHistory([...history.slice(0, historyIndex + 1), newState]);
          setHistoryIndex(historyIndex + 1);
        } else {
          setHistory([...history, newState]);
          setHistoryIndex(history.length);
        }
      } catch (err) {
        console.error('Error updating Mermaid from connection:', err);
      }
      
      return updatedEdges;
    });
  }, [nodes, history, historyIndex]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (onSave) {
        await onSave({ 
          mermaidCode, 
          reactFlowData: { nodes, edges } 
        });
      }
      setError(null);
    } catch (err) {
      console.error('Error saving diagram:', err);
      setError('Failed to save diagram: ' + err.message);
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
          
          // Convert the suggested mermaid code to nodes and edges
          const { nodes: suggestedNodes, edges: suggestedEdges } = mermaidToReactFlow(suggestion.mermaidCode);
          setNodes(suggestedNodes);
          setEdges(suggestedEdges);
          
          // Add to history
          const newState = { 
            mermaidCode: suggestion.mermaidCode,
            nodes: suggestedNodes,
            edges: suggestedEdges
          };
          
          setHistory([...history.slice(0, historyIndex + 1), newState]);
          setHistoryIndex(historyIndex + 1);
        }
      }
      setError(null);
      setShowCustomForm(false);
    } catch (err) {
      console.error('Error getting AI suggestions:', err);
      setError('Failed to get AI suggestions: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      
      setMermaidCode(previousState.mermaidCode);
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      
      setMermaidCode(nextState.mermaidCode);
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  const handleDownload = useCallback(() => {
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
  }, [mermaidCode, viewMode]);

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
      setError(null);
      
      // Add to history if code was changed
      const lastState = history[historyIndex];
      if (!lastState || lastState.mermaidCode !== mermaidCode) {
        const newState = {
          mermaidCode,
          nodes: convertedNodes,
          edges: convertedEdges
        };
        
        setHistory([...history.slice(0, historyIndex + 1), newState]);
        setHistoryIndex(historyIndex + 1);
      }
      
      setViewMode('edit');
    } catch (err) {
      setError('Invalid Mermaid code: ' + err.message);
    }
  }, [mermaidCode, history, historyIndex]);

  // Drag-and-drop handlers for the toolbar
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleInsertNode = (type) => {
    const newNode = {
      id: `${type}_${Date.now()}`,
      type,
      position: { 
        x: 150 + Math.random() * 100, 
        y: 150 + Math.random() * 100 
      },
      data: { 
        label: `${type.charAt(0).toUpperCase() + type.slice(1)}` 
      }
    };
    
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    
    // Update mermaid code
    try {
      const newMermaidCode = reactFlowToMermaid({ 
        nodes: updatedNodes, 
        edges 
      });
      setMermaidCode(newMermaidCode);
      
      // Add to history
      const newState = { 
        mermaidCode: newMermaidCode,
        nodes: updatedNodes,
        edges: JSON.parse(JSON.stringify(edges))
      };
      
      setHistory([...history.slice(0, historyIndex + 1), newState]);
      setHistoryIndex(historyIndex + 1);
    } catch (err) {
      console.error('Error updating after node insertion:', err);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h2 className="font-semibold text-gray-800 text-sm">System Design Diagram</h2>
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button onClick={() => setViewMode('edit')} className={`px-2 py-1 text-xs ${viewMode === 'edit' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <Edit className="h-3 w-3 inline-block mr-1" />
              Edit
            </button>
            <button onClick={() => setViewMode('preview')} className={`px-2 py-1 text-xs ${viewMode === 'preview' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <Eye className="h-3 w-3 inline-block mr-1" />
              Preview
            </button>
            <button onClick={() => setViewMode('code')} className={`px-2 py-1 text-xs ${viewMode === 'code' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <Code className="h-3 w-3 inline-block mr-1" />
              Code
            </button>
          </div>
        </div>
        <div className="flex space-x-1">
          <button onClick={handleUndo} disabled={historyIndex <= 0} className={`p-1 rounded ${historyIndex > 0 ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300'}`} title="Undo">
            <Undo className="h-3 w-3" />
          </button>
          <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className={`p-1 rounded ${historyIndex < history.length - 1 ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300'}`} title="Redo">
            <Redo className="h-3 w-3" />
          </button>
          <button onClick={handleSave} className="p-1 rounded hover:bg-gray-100 text-gray-600" title="Save Diagram" disabled={isLoading}>
            <Save className={`h-3 w-3 ${isLoading ? 'animate-pulse' : ''}`} />
          </button>
          <button onClick={handleDownload} className="p-1 rounded hover:bg-gray-100 text-gray-600" title="Download">
            <Download className="h-3 w-3" />
          </button>
          <button onClick={() => handleAiSuggest()} className="p-1 rounded hover:bg-gray-100 text-gray-600" title="Get AI Suggestions" disabled={isLoading}>
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowCustomForm(!showCustomForm)} className="p-1 rounded hover:bg-gray-100 text-gray-600" title="Custom Request">
            <MessageSquare className="h-3 w-3" />
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-600" title="Close">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      {showCustomForm && (
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleCustomRequest} className="flex">
            <input
              type="text"
              value={customRequest}
              onChange={(e) => setCustomRequest(e.target.value)}
              placeholder="Request specific diagram improvements..."
              className="flex-1 border border-gray-300 rounded-l-lg px-3 py-1 text-sm focus:outline-none"
            />
            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded-r-lg text-sm" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Send'}
            </button>
          </form>
        </div>
      )}
      {error && (
        <div className="px-3 py-2 bg-red-50 border-b border-red-200 text-red-700 text-xs">
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
            <div className="p-2 border-t border-gray-200 bg-gray-50">
              <h3 className="text-xs font-medium mb-2">Add Components</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { type: 'client', icon: <Globe className="h-6 w-6 text-blue-500" />, label: 'Client' },
                  { type: 'service', icon: <Server className="h-6 w-6 text-green-500" />, label: 'Service' },
                  { type: 'database', icon: <Database className="h-6 w-6 text-purple-500" />, label: 'Database' },
                  { type: 'cache', icon: <Archive className="h-6 w-6 text-red-500" />, label: 'Cache' },
                  { type: 'loadBalancer', icon: <Grid className="h-6 w-6 text-orange-500" />, label: 'Load Balancer' },
                  { type: 'queue', icon: <Share2 className="h-6 w-6 text-indigo-500" />, label: 'Queue' },
                  { type: 'custom', icon: <Box className="h-6 w-6 text-gray-500" />, label: 'Custom' }
                ].map(({ type, icon, label }) => (
                  <div
                    key={type}
                    className="flex flex-col items-center p-2 bg-white border border-gray-200 rounded shadow-sm hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-move"
                    draggable
                    onDragStart={(event) => onDragStart(event, type)}
                  >
                    {icon}
                    <span className="text-xs mt-1">{label}</span>
                  </div>
                ))}
              </div>
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
              className="w-full flex-1 font-mono text-sm p-4 border border-gray-300 rounded resize-none"
              placeholder="Mermaid diagram code"
            />
            <div className="mt-4">
              <button
                onClick={updateMermaidFromEditor}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
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