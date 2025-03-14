// client/components/diagram/DiagramPanel.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import { X, Download, RefreshCw, MessageSquare, Code, Eye, Edit, Undo, Redo, Save, Database, Server, Globe, Archive, Grid, Share2, Box, ArrowRight, BarChart, Activity } from 'lucide-react';
import { mermaidToReactFlow, reactFlowToMermaid } from './utils/conversion';
import dynamic from 'next/dynamic';
import DiagramEvaluation from './DiagramEvaluation';
import DiagramAnalysis from './DiagramAnalysis';

const MermaidRenderer = dynamic(() => import('./MermaidRenderer'), { ssr: false });
const ReactFlowDiagramWithProvider = dynamic(() => import('./ReactFlowDiagram'), { ssr: false });

const DiagramPanel = ({
  hideModes = false,
  sessionId,
  sessionType = 'coaching',
  initialDiagram = null,
  onClose,
  onSave,
  onRefresh,
  onAiSuggest,
  onSaveAndContinue, // Add this prop
}) => {
  // When hideModes is true, force viewMode to 'edit' and don't allow changing it
  const [viewMode, setViewMode] = useState('edit');
  
  // Always force edit mode when hideModes is true
  useEffect(() => {
    if (hideModes) {
      setViewMode('edit');
    }
  }, [hideModes]);

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
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const initializedRef = useRef(false);

  // Add new state
  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Add evaluation function
  const handleEvaluate = async () => {
    try {
      setIsEvaluating(true);
      const diagramData = viewMode === 'edit' 
        ? { nodes, edges, type: 'reactflow' }
        : { code: mermaidCode, type: 'mermaid' };
      
      const response = await fetch('/api/diagrams/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          diagram: diagramData,
          context: {
            sessionType,
            diagramType: currentDiagramType
          }
        })
      });

      const result = await response.json();
      setEvaluation(result);
    } catch (error) {
      console.error('Failed to evaluate diagram:', error);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Add analysis function
  const analyzeDiagram = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/diagram/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes,
          edges,
          type: diagramType
        }),
      });
      
      const result = await response.json();
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing diagram:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Initialize from mermaid code only once
  useEffect(() => {
    if (initialDiagram && !initializedRef.current) {
      try {
        const code = initialDiagram.mermaidCode;
        setMermaidCode(code);
        const { nodes: convertedNodes, edges: convertedEdges } = mermaidToReactFlow(code);
        setNodes(convertedNodes);
        setEdges(convertedEdges);
        setHistory([{ mermaidCode: code, nodes: convertedNodes, edges: convertedEdges }]);
        setHistoryIndex(0);
        setError(null);
        initializedRef.current = true;
      } catch (err) {
        console.error('Error converting Mermaid to React Flow:', err);
        setError('Failed to initialize diagram: ' + err.message);
      }
    }
  }, [initialDiagram]);

  // Auto-save whenever diagram changes
  useEffect(() => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    
    const timer = setTimeout(() => {
      if (mermaidCode && saveStatus !== 'saving') {
        handleSave();
      }
    }, 3000); // Auto-save after 3 seconds of no changes
    
    setAutoSaveTimer(timer);
    
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [mermaidCode, nodes, edges]);

  // Only initialize if nodes/edges are still empty and not already initialized
  useEffect(() => {
    if (!initializedRef.current && nodes.length === 0 && edges.length === 0 && mermaidCode) {
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
        initializedRef.current = true;
      } catch (err) {
        console.error('Error initializing diagram:', err);
      }
    }
  }, [mermaidCode, nodes.length, edges.length, history.length]);

  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => {
      const updatedNodes = applyNodeChanges(changes, nds);
      // Only update if the change is significant
      if (changes.some(change => change.type !== 'select' && change.type !== 'position')) {
        try {
          const newMermaidCode = reactFlowToMermaid({ nodes: updatedNodes, edges });
          // Only update if new code is actually different
          if (newMermaidCode !== mermaidCode) {
            setMermaidCode(newMermaidCode);
            const newState = { mermaidCode: newMermaidCode, nodes: updatedNodes, edges: JSON.parse(JSON.stringify(edges)) };
            setHistory(prev => [...prev.slice(0, historyIndex + 1), newState]);
            setHistoryIndex(prevIndex => prevIndex + 1);
          }
        } catch (err) {
          console.error('Error updating Mermaid from nodes:', err);
        }
      }
      return updatedNodes;
    });
  }, [edges, historyIndex, mermaidCode]);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => {
      const updatedEdges = applyEdgeChanges(changes, eds);
      if (changes.length > 0) {
        try {
          const newMermaidCode = reactFlowToMermaid({ nodes, edges: updatedEdges });
          if (newMermaidCode !== mermaidCode) {
            setMermaidCode(newMermaidCode);
            const newState = { mermaidCode: newMermaidCode, nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(updatedEdges)) };
            setHistory(prev => [...prev.slice(0, historyIndex + 1), newState]);
            setHistoryIndex(prevIndex => prevIndex + 1);
          }
        } catch (err) {
          console.error('Error updating Mermaid from edges:', err);
        }
      }
      return updatedEdges;
    });
  }, [nodes, historyIndex, mermaidCode]);

  const onConnect = useCallback((connection) => {
    const newEdge = {
      ...connection,
      id: `edge-${connection.source}-${connection.target}`,
      type: 'smoothstep'
    };
    
    setEdges((eds) => {
      const updatedEdges = addEdge(newEdge, eds);
      try {
        const newMermaidCode = reactFlowToMermaid({ nodes, edges: updatedEdges });
        if (newMermaidCode !== mermaidCode) {
          setMermaidCode(newMermaidCode);
          const newState = { mermaidCode: newMermaidCode, nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(updatedEdges)) };
          setHistory(prev => [...prev.slice(0, historyIndex + 1), newState]);
          setHistoryIndex(prevIndex => prevIndex + 1);
        }
      } catch (err) {
        console.error('Error updating Mermaid from connection:', err);
      }
      return updatedEdges;
    });
  }, [nodes, historyIndex, mermaidCode]);

  const handleSave = async () => {
    if (saveStatus === 'saving') return;
    
    setSaveStatus('saving');
    setIsLoading(true);
    try {
      const diagramData = {
        mermaidCode,
        reactFlowData: { nodes, edges },
        timestamp: new Date().toISOString(),
        version: 1, // For versioning support
      };

      if (onSave) {
        await onSave(diagramData);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Error saving diagram:', err);
      setSaveStatus('error');
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
          const { nodes: suggestedNodes, edges: suggestedEdges } = mermaidToReactFlow(suggestion.mermaidCode);
          setNodes(suggestedNodes);
          setEdges(suggestedEdges);
          const newState = { mermaidCode: suggestion.mermaidCode, nodes: suggestedNodes, edges: suggestedEdges };
          setHistory(prev => [...prev.slice(0, historyIndex + 1), newState]);
          setHistoryIndex(prevIndex => prevIndex + 1);
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
      const prevState = history[newIndex];
      setMermaidCode(prevState.mermaidCode);
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
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
      const { nodes: newNodes, edges: newEdges } = mermaidToReactFlow(mermaidCode);
      setNodes(newNodes);
      setEdges(newEdges);
      setError(null);
      const lastState = history[historyIndex];
      if (!lastState || lastState.mermaidCode !== mermaidCode) {
        const newState = {
          mermaidCode,
          nodes: newNodes,
          edges: newEdges
        };
        setHistory(prev => [...prev.slice(0, historyIndex + 1), newState]);
        setHistoryIndex(prevIndex => prevIndex + 1);
      }
      
      // Only change view mode if hideModes is false
      if (!hideModes) {
        setViewMode('edit');
      }
    } catch (err) {
      setError('Invalid Mermaid code: ' + err.message);
    }
  }, [mermaidCode, history, historyIndex, hideModes]);

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
    
    try {
      const newMermaidCode = reactFlowToMermaid({ 
        nodes: updatedNodes, 
        edges 
      });
      setMermaidCode(newMermaidCode);
      
      const newState = { 
        mermaidCode: newMermaidCode,
        nodes: updatedNodes,
        edges: JSON.parse(JSON.stringify(edges))
      };
      
      setHistory(prev => [...prev.slice(0, historyIndex + 1), newState]);
      setHistoryIndex(prevIndex => prevIndex + 1);
    } catch (err) {
      console.error('Error updating after node insertion:', err);
    }
  };

  // The actual content to render depends on viewMode, but we force 'edit' mode when hideModes is true
  const effectiveViewMode = hideModes ? 'edit' : viewMode;

  // Update save button UI based on status
  const getSaveButtonUI = () => {
    const baseClasses = "px-3 py-1 rounded-md flex items-center space-x-1 text-sm";
    
    return (
      <div className="flex items-center">
        {saveStatus === 'saving' ? (
          <button disabled className={`${baseClasses} bg-gray-100 text-gray-400`}>
            <RefreshCw className="h-4 w-4 animate-spin mr-1" />
            <span>Saving...</span>
          </button>
        ) : saveStatus === 'saved' ? (
          <button disabled className={`${baseClasses} bg-green-100 text-green-700`}>
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>Saved</span>
          </button>
        ) : saveStatus === 'error' ? (
          <button onClick={handleSave} className={`${baseClasses} bg-red-100 text-red-700 hover:bg-red-200`}>
            <XCircle className="h-4 w-4 mr-1" />
            <span>Retry</span>
          </button>
        ) : (
          <button 
            onClick={handleSave} 
            className={`${baseClasses} bg-blue-600 text-white hover:bg-blue-700`}
          >
            <Save className="h-4 w-4 mr-1" />
            <span>Save</span>
          </button>
        )}
      </div>
    );
  };

  const handleSaveAndContinue = async () => {
    if (saveStatus === 'saving') return;
    
    setSaveStatus('saving');
    setIsLoading(true);
    try {
      const diagramData = {
        mermaidCode,
        reactFlowData: { nodes, edges },
        timestamp: new Date().toISOString(),
        version: 1,
      };

      // First save the diagram
      if (onSave) {
        await onSave(diagramData);
      }
      
      setSaveStatus('saved');
      
      // Then trigger the continue action
      if (onSaveAndContinue) {
        await onSaveAndContinue(diagramData);
      }
    } catch (err) {
      console.error('Error in save and continue:', err);
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const createNode = (type, position, data = {}) => {
    return {
      id: `node-${Date.now()}`,
      type: type,
      position: position,
      data: {
        ...data,
        description: data.description?.split(',').join('\n'), // Convert comma-separated text to bullet points
        label: data.label || 'New Node'
      },
      style: {
        width: 200,
        padding: 10
      }
    };
  };

  // When adding a new node
  const handleAddNode = (type, position) => {
    const newNode = createNode(type, position, {
      label: 'New Component',
      description: 'Description 1,Description 2,Description 3' // Will be converted to bullet points
    });
    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <div className="relative h-full">
      {/* Existing diagram editor UI */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {/* ... other buttons ... */}
        <button
          onClick={handleEvaluate}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <BarChart className="w-4 h-4" />
          Evaluate
        </button>
        <button
          onClick={analyzeDiagram}
          disabled={isAnalyzing}
          className={`flex items-center gap-2 px-3 py-2 rounded ${
            isAnalyzing 
              ? 'bg-gray-100 text-gray-500'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isAnalyzing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Activity className="w-4 h-4" />
          )}
          Analyze
        </button>
      </div>

      {/* Main diagram area */}
      {mode === 'edit' ? (
        <ReactFlowDiagramWithProvider
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        />
      ) : (
        <MermaidRenderer code={reactFlowToMermaid({ nodes, edges })} />
      )}

      {/* Evaluation overlay */}
      {showEvaluation && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <DiagramEvaluation
            sessionId={sessionId}
            evaluation={currentEvaluation}
            previousEvaluation={previousEvaluation}
            onClose={() => setShowEvaluation(false)}
          />
        </div>
      )}

      {/* Analysis overlay */}
      {analysis && (
        <DiagramAnalysis
          analysis={analysis}
          onClose={() => setAnalysis(null)}
        />
      )}
    </div>
  );
};

export default DiagramPanel;