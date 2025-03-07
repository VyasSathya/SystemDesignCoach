import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/Sidebar';
import { 
  getCoachingSession, 
  sendCoachingMessage, 
  getCoachingMaterials, 
  getCoachingDiagram 
} from '../../utils/api';
import { Send, Book, ArrowLeft, Image, X, Code, Eye, Edit, Undo, Redo, Save, Download, RefreshCw, MessageSquare } from 'lucide-react';
import dynamic from 'next/dynamic';
import { mermaidToReactFlow, reactFlowToMermaid } from '../../components/diagram/utils/conversion';

// Use dynamic import for components that require client-side rendering
const MermaidRenderer = dynamic(() => import('../../components/diagram/MermaidRenderer'), { ssr: false });
const ReactFlowDiagramWithProvider = dynamic(() => import('../../components/diagram/ReactFlowDiagram'), { ssr: false });
const DiagramToolbar = dynamic(() => import('../../components/diagram/DiagramToolbar'), { ssr: false });
const MermaidToolbar = dynamic(() => import('../../components/MermaidToolbar'), { ssr: false });

function CoachingSessionPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated } = useAuth();
  const [session, setSession] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [materials, setMaterials] = useState(null);
  const [isFetchingMaterials, setIsFetchingMaterials] = useState(false);
  const messagesEndRef = useRef(null);
  
  // State for diagram
  const [diagram, setDiagram] = useState(null);
  const [isLoadingDiagram, setIsLoadingDiagram] = useState(false);
  const [viewMode, setViewMode] = useState('code');
  const [mermaidCode, setMermaidCode] = useState('graph TD\n    Client[Client] --> API[API Gateway]\n    API --> Service[Service]\n    Service --> DB[(Database)]');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [customRequest, setCustomRequest] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize everything when the session loads
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (id) {
      fetchCoachingSession();
    }
  }, [id, isAuthenticated, router]);

  // Scroll to bottom of message list when conversation updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session?.conversation]);

  // Initialize nodes and edges from mermaid code when diagram changes
  useEffect(() => {
    if (diagram?.mermaidCode) {
      setMermaidCode(diagram.mermaidCode);
      try {
        const { nodes: convertedNodes, edges: convertedEdges } = mermaidToReactFlow(diagram.mermaidCode);
        setNodes(convertedNodes);
        setEdges(convertedEdges);
        
        // Initialize history
        if (history.length === 0) {
          setHistory([{ 
            mermaidCode: diagram.mermaidCode, 
            nodes: convertedNodes, 
            edges: convertedEdges 
          }]);
          setHistoryIndex(0);
        }
      } catch (err) {
        console.error('Error converting Mermaid to React Flow:', err);
        setError('Failed to initialize diagram editor');
      }
    }
  }, [diagram]);

  const fetchCoachingSession = async () => {
    try {
      setLoading(true);
      // Use id "1" if the current id is not a valid MongoDB ObjectId
      const sessionId = /^[0-9a-fA-F]{24}$/.test(id) ? id : "1";
      const data = await getCoachingSession(sessionId);
      if (data && data.session) {
        setSession(data.session);
        if (!diagram) {
          setDiagram({
            type: 'architecture',
            mermaidCode:
              'graph TD\n    Client[Client] --> API[API Gateway]\n    API --> Service[Service]\n    Service --> DB[(Database)]',
            description: 'Initial system architecture diagram. Use the toolbar to add components or modify the diagram.',
            problemId: data.session.problemId
          });
        }
      } else {
        console.error('No session data received');
      }
    } catch (error) {
      console.error('Error fetching coaching session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;
    try {
      setSending(true);
      // Use id "1" if the current id is not a valid MongoDB ObjectId
      const sessionId = /^[0-9a-fA-F]{24}$/.test(id) ? id : "1";
      const updatedSession = {
        ...session,
        conversation: [
          ...session.conversation,
          {
            role: 'student',
            content: message,
            timestamp: new Date().toISOString()
          }
        ]
      };
      setSession(updatedSession);
      setMessage('');
      const response = await sendCoachingMessage(sessionId, message);
      if (response && response.session) {
        setSession(response.session);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleGetMaterials = async (topic) => {
    if (isFetchingMaterials) return;
    try {
      setIsFetchingMaterials(true);
      // Use id "1" if the current id is not a valid MongoDB ObjectId
      const sessionId = /^[0-9a-fA-F]{24}$/.test(id) ? id : "1";
      const response = await getCoachingMaterials(sessionId, topic);
      if (response && response.materials) {
        setMaterials(response.materials);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setIsFetchingMaterials(false);
    }
  };

  const handleRequestDiagram = async (diagramType, customPrompt = null) => {
    if (isLoadingDiagram) return;
    try {
      setIsLoadingDiagram(true);
      // Use id "1" if the current id is not a valid MongoDB ObjectId
      const sessionId = /^[0-9a-fA-F]{24}$/.test(id) ? id : "1";
      const response = await getCoachingDiagram(sessionId, diagramType, customPrompt);
      if (response && response.diagram) {
        setDiagram(response.diagram);
      }
    } catch (error) {
      console.error('Error fetching diagram:', error);
    } finally {
      setIsLoadingDiagram(false);
    }
  };

  const handleSaveDiagram = async () => {
    try {
      setIsLoadingDiagram(true);
      // Update diagram with current mermaid code
      setDiagram({
        ...diagram,
        mermaidCode: mermaidCode
      });
      return true;
    } catch (error) {
      console.error('Error saving diagram:', error);
      return false;
    } finally {
      setIsLoadingDiagram(false);
    }
  };

  const handleAiSuggest = async (customPrompt = null) => {
    setIsLoadingDiagram(true);
    try {
      // Use id "1" if the current id is not a valid MongoDB ObjectId
      const sessionId = /^[0-9a-fA-F]{24}$/.test(id) ? id : "1";
      const response = await getCoachingDiagram(sessionId, 'architecture', customPrompt || 'Suggest improvements to this diagram');
      if (response && response.diagram) {
        setDiagram(response.diagram);
      }
      setError(null);
      setShowCustomForm(false);
    } catch (err) {
      console.error('Error getting AI suggestions:', err);
      setError('Failed to get AI suggestions');
    } finally {
      setIsLoadingDiagram(false);
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

  const updateMermaidFromEditor = () => {
    try {
      const { nodes: convertedNodes, edges: convertedEdges } = mermaidToReactFlow(mermaidCode);
      setNodes(convertedNodes);
      setEdges(convertedEdges);
      // Add to history
      setHistory([...history.slice(0, historyIndex + 1), { 
        mermaidCode, 
        nodes: convertedNodes, 
        edges: convertedEdges 
      }]);
      setHistoryIndex(history.length);
      setViewMode('edit');
    } catch (err) {
      setError('Invalid Mermaid code: ' + err.message);
    }
  };

  const onNodesChange = (changes) => {
    const updatedNodes = applyNodeChanges(changes, nodes);
    setNodes(updatedNodes);
    updateMermaidFromNodes(updatedNodes, edges);
  };

  const onEdgesChange = (changes) => {
    const updatedEdges = applyEdgeChanges(changes, edges);
    setEdges(updatedEdges);
    updateMermaidFromNodes(nodes, updatedEdges);
  };

  const onConnect = (connection) => {
    const newEdge = { 
      ...connection, 
      id: `e-${connection.source}-${connection.target}`,
      type: 'smoothstep' 
    };
    const updatedEdges = addEdge(newEdge, edges);
    setEdges(updatedEdges);
    updateMermaidFromNodes(nodes, updatedEdges);
  };

  const updateMermaidFromNodes = (updatedNodes, updatedEdges) => {
    if (updatedNodes.length === 0) return;
    
    try {
      const newMermaidCode = reactFlowToMermaid({ nodes: updatedNodes, edges: updatedEdges });
      if (newMermaidCode !== mermaidCode) {
        setMermaidCode(newMermaidCode);
        
        // Add to history if significantly different
        const lastItem = history[historyIndex];
        if (!lastItem || JSON.stringify(updatedNodes) !== JSON.stringify(lastItem.nodes) || 
            JSON.stringify(updatedEdges) !== JSON.stringify(lastItem.edges)) {
          const newHistory = history.slice(0, historyIndex + 1);
          newHistory.push({ 
            mermaidCode: newMermaidCode, 
            nodes: JSON.parse(JSON.stringify(updatedNodes)), 
            edges: JSON.parse(JSON.stringify(updatedEdges)) 
          });
          setHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
        }
      }
    } catch (err) {
      console.error('Error converting to Mermaid:', err);
    }
  };
  
  const handleInsertSnippet = (snippet) => {
    const newCode = mermaidCode + '\n' + snippet;
    setMermaidCode(newCode);
    try {
      const { nodes: convertedNodes, edges: convertedEdges } = mermaidToReactFlow(newCode);
      setNodes(convertedNodes);
      setEdges(convertedEdges);
      setHistory([...history.slice(0, historyIndex + 1), { 
        mermaidCode: newCode, 
        nodes: convertedNodes, 
        edges: convertedEdges 
      }]);
      setHistoryIndex(history.length);
    } catch (err) {
      setError('Error updating diagram: ' + err.message);
    }
  };

  const getMessageColorClass = (role) => {
    switch (role) {
      case 'coach':
        return 'bg-green-50 border border-green-200 text-gray-800';
      case 'student':
        return 'bg-indigo-600 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar activeTab="coaching" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading coaching session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen">
        <Sidebar activeTab="coaching" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Coaching session not found</p>
            <button onClick={() => router.push('/coaching')} className="bg-green-600 text-white px-4 py-2 rounded">
              Back to Coaching
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab="coaching" />
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <button onClick={() => router.push('/coaching')} className="flex items-center text-sm text-gray-600 hover:text-gray-800 mb-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to coaching
              </button>
              <h1 className="text-xl font-semibold">Learning: {session.problem?.title || 'System Design'}</h1>
              <p className="text-sm text-gray-500">
                Current stage: <span className="font-medium capitalize">{session.currentStage}</span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium capitalize">
                {session.currentStage} stage
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 flex flex-col border-r border-gray-200">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {session.conversation.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-full rounded-lg p-4 ${getMessageColorClass(msg.role)}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === 'coach' && (
                      <div className="flex mt-2 space-x-2 flex-wrap">
                        {['architecture', 'data model', 'scaling'].some(topic =>
                          msg.content.toLowerCase().includes(topic)
                        ) && (
                          <button
                            onClick={() =>
                              handleGetMaterials(
                                msg.content.toLowerCase().includes('architecture')
                                  ? 'architecture'
                                  : msg.content.toLowerCase().includes('data model')
                                  ? 'data modeling'
                                  : 'scaling'
                              )
                            }
                            className="text-xs bg-white text-green-700 px-2 py-1 rounded border border-green-200 flex items-center mt-1 mr-1"
                          >
                            <Book className="h-3 w-3 mr-1" />
                            Learn more
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask your coach a question..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={session.status !== 'in_progress'}
                />
                <button type="submit" disabled={!message.trim() || sending || session.status !== 'in_progress'} className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:bg-green-300 flex items-center">
                  {sending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
          <div className="w-1/2 flex flex-col">
            {isLoadingDiagram ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating diagram...</p>
                </div>
              </div>
            ) : !diagram ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <button onClick={() => handleRequestDiagram('architecture')} className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center mx-auto">
                    <Image className="h-5 w-5 mr-2" />
                    Generate Diagram
                  </button>
                  <p className="text-gray-500 mt-4">Start with an architecture diagram based on your conversation</p>
                  <p className="text-gray-400 mt-2 text-sm">Or you can create one from scratch by clicking below</p>
                  <button onClick={() => {
                    setDiagram({
                      type: 'architecture',
                      mermaidCode:
                        'graph TD\n    Client[Client] --> API[API Gateway]\n    API --> Service[Service]\n    Service --> DB[(Database)]',
                      description: 'System architecture diagram',
                      problemId: session.problemId
                    });
                  }} className="text-blue-600 underline text-sm mt-2">
                    Start with blank diagram
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="bg-white p-3 border-b flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-sm font-medium">System Architecture Diagram</h2>
                    <div className="flex border border-gray-300 rounded-md overflow-hidden">
                      <button onClick={() => setViewMode('edit')} className={`px-2 py-1 text-xs ${viewMode === 'edit' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                        <Edit className="h-3 w-3 inline mr-1" />
                        Edit
                      </button>
                      <button onClick={() => setViewMode('preview')} className={`px-2 py-1 text-xs ${viewMode === 'preview' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                        <Eye className="h-3 w-3 inline mr-1" />
                        Preview
                      </button>
                      <button onClick={() => setViewMode('code')} className={`px-2 py-1 text-xs ${viewMode === 'code' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                        <Code className="h-3 w-3 inline mr-1" />
                        Code
                      </button>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button onClick={handleUndo} disabled={historyIndex <= 0} className={`p-1 rounded ${historyIndex > 0 ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300'}`}>
                      <Undo className="h-3 w-3" />
                    </button>
                    <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className={`p-1 rounded ${historyIndex < history.length - 1 ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300'}`}>
                      <Redo className="h-3 w-3" />
                    </button>
                    <button onClick={handleSaveDiagram} className="p-1 rounded hover:bg-gray-100 text-gray-600">
                      <Save className="h-3 w-3" />
                    </button>
                    <button onClick={handleDownload} className="p-1 rounded hover:bg-gray-100 text-gray-600">
                      <Download className="h-3 w-3" />
                    </button>
                    <button onClick={() => handleAiSuggest()} className="p-1 rounded hover:bg-gray-100 text-gray-600">
                      <RefreshCw className="h-3 w-3" />
                    </button>
                    <button onClick={() => setShowCustomForm(!showCustomForm)} className="p-1 rounded hover:bg-gray-100 text-gray-600">
                      <MessageSquare className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                {showCustomForm && (
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <form onSubmit={handleCustomRequest} className="flex">
                      <input
                        type="text"
                        value={customRequest}
                        onChange={(e) => setCustomRequest(e.target.value)}
                        placeholder="Request diagram improvements..."
                        className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 text-sm focus:outline-none"
                      />
                      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-lg text-sm">
                        {isLoadingDiagram ? 'Generating...' : 'Send'}
                      </button>
                    </form>
                  </div>
                )}
                {error && (
                  <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-xs">
                    {error}
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  {viewMode === 'edit' && (
                    <div className="h-full flex flex-col">
                      <div className="flex-1 min-h-0"> 
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
                        <MermaidToolbar onInsert={handleInsertSnippet} />
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
                          className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
                        >
                          Apply Changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {materials && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <div className="bg-white rounded-lg w-2/3 h-3/4 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold">{materials.topic}</h2>
                <button onClick={() => setMaterials(null)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 prose max-w-none overflow-y-auto flex-1">
                <div dangerouslySetInnerHTML={{ __html: materials.content.replace(/\n/g, '<br>') }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CoachingSessionPage;