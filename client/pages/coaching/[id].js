import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft,
  Save,
  Send,
  RefreshCw,
  MessageSquare,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import { useAuth } from '../../contexts/AuthContext';
import {
  getCoachingSession,
  sendCoachingMessage,
  getCoachingMaterials,
  getCoachingDiagram,
  saveDiagram
} from '../../utils/api';
import { mermaidToReactFlow, reactFlowToMermaid } from '../../components/diagram/utils/conversion';
import TopicGuidedCoaching from '../../components/coaching/TopicGuidedCoaching';

const MermaidRenderer = dynamic(() => import('../../components/diagram/MermaidRenderer'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-100 h-full w-full"></div>
});
const ReactFlowDiagramWithProvider = dynamic(() => import('../../components/diagram/ReactFlowDiagram'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>
  )
});

const CoachingSessionPage = () => {
  const router = useRouter();
  const { sessionId } = router.query;
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Session state
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [currentTopic, setCurrentTopic] = useState('REQUIREMENTS');
  const [includeDiagram, setIncludeDiagram] = useState(false);
  const [requestDiagramSuggestions, setRequestDiagramSuggestions] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Diagram state
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [diagramCode, setDiagramCode] = useState(
    'graph TD\n    Client[Client] --> API[API Gateway]\n    API --> Service[Service]\n    Service --> DB[(Database)]'
  );
  const [viewMode, setViewMode] = useState('edit');
  const [currentDiagramState, setCurrentDiagramState] = useState(null);
  const [isSavingDiagram, setIsSavingDiagram] = useState(false);
  const [diagramSuggestions, setDiagramSuggestions] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

// Entire file remains the same, with modifications in fetchSession function

useEffect(() => {
  console.log('FULL ROUTER QUERY:', router.query);
  console.log('SESSION ID FROM ROUTER:', router.query.id);

  const sessionId = router.query.id;

  if (!sessionId) {
    console.error('NO VALID SESSION ID');
    setLoading(false);
    return;
  }

  const fetchSession = async () => {
    try {
      const data = await getCoachingSession(sessionId);
      console.log('SESSION DATA:', JSON.stringify(data, null, 2));

      const initialMessages = data.conversation 
        ? data.conversation.map((msg, index) => ({
            id: index,
            role: msg.role === 'system' ? 'system' : 
                   msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content || "No content available",
            timestamp: msg.timestamp || new Date().toISOString()
          }))
        : [{
            id: 0,
            role: 'assistant',
            content: `Welcome to your ${data.problem?.title || 'system design'} coaching session. Let's begin our system design journey!`,
            timestamp: new Date().toISOString()
          }];

      console.log('INITIAL MESSAGES:', JSON.stringify(initialMessages, null, 2));
      setMessages(initialMessages);
      setSession(data);
      setError(null);
    } catch (err) {
      console.error('FETCH SESSION ERROR:', err);
      setError("Failed to load coaching session");
      setMessages([{
        id: 0,
        role: 'assistant',
        content: "Welcome to your system design coaching session. There was an error loading the session.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  fetchSession();
}, [router.query]);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const detectCurrentTopic = (conversation) => {
    const topicKeywords = {
      'REQUIREMENTS': ['requirements', 'features', 'functional', 'non-functional', 'constraints', 'users', 'scale'],
      'ARCHITECTURE': ['architecture', 'components', 'services', 'monolith', 'microservices', 'api'],
      'STORAGE': ['database', 'storage', 'schema', 'SQL', 'NoSQL', 'cache', 'data model'],
      'SCALABILITY': ['scale', 'scaling', 'load balancing', 'horizontal', 'vertical', 'throughput'],
      'RELIABILITY': ['reliability', 'fault tolerance', 'redundancy', 'availability', 'monitoring']
    };
    const recentMessages = conversation.slice(-5);
    const combinedText = recentMessages.map(msg => typeof msg.content === 'string' ? msg.content.toLowerCase() : '').join(' ');
    let bestTopic = 'REQUIREMENTS';
    let highestCount = 0;
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      const count = keywords.reduce((sum, keyword) => sum + (combinedText.includes(keyword.toLowerCase()) ? 1 : 0), 0);
      if (count > highestCount) {
        highestCount = count;
        bestTopic = topic;
      }
    }
    setCurrentTopic(bestTopic);
  };

  const handleSendMessage = async (message, contextInfo = null) => {
    if (!message || typeof message !== 'string' || message.trim() === '') {
      console.error("Invalid message:", message);
      return;
    }
    setIsSending(true);
    console.log("Sending message to session:", router.query.id, message);
    try {
      if (!router.query.id) {
        console.error("No valid sessionId provided to sendCoachingMessage");
        setMessages(prev => [
          ...prev,
          {
            id: prev.length,
            role: 'assistant',
            content: "There seems to be an issue with the session ID. Please refresh or start a new session.",
            timestamp: new Date().toISOString()
          }
        ]);
        setIsSending(false);
        return;
      }
      const userMessage = {
        id: messages.length,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);

      let finalContextInfo = contextInfo || {};
      if (!finalContextInfo.diagramContext && includeDiagram && currentDiagramState) {
        finalContextInfo.diagramContext = currentDiagramState;
      }
      if (!finalContextInfo.requestDiagramSuggestions && requestDiagramSuggestions) {
        finalContextInfo.requestDiagramSuggestions = true;
      }
      
      setIsTyping(true);
      const response = await sendCoachingMessage(
        router.query.id,
        message,
        Object.keys(finalContextInfo).length > 0 ? finalContextInfo : null
      );
      console.log("Message response:", response);
      if (response && response.message) {
        const responseMessage = {
          id: messages.length + 1,
          role: response.message.role === 'coach' ? 'assistant' : response.message.role,
          content: response.message.content,
          timestamp: response.message.timestamp || new Date().toISOString()
        };
        setMessages(prev => [...prev, responseMessage]);
        setSession(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            conversation: [
              ...(prev.conversation || []),
              userMessage,
              {
                role: response.message.role,
                content: response.message.content,
                timestamp: response.message.timestamp
              }
            ]
          };
        });
        console.log("Checking for diagram suggestions:", response.diagramSuggestions);
        if (response.diagramSuggestions) {
          console.log("Diagram suggestions found, processing them...");
          handleDiagramSuggestions(response.diagramSuggestions);
        } else if (requestDiagramSuggestions) {
          console.log("No suggestions in response, generating from context...");
          handleGetDiagramSuggestion();
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: prev.length + 1,
            role: 'assistant',
            content: "I'm having trouble processing your request. Please try again.",
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          role: 'assistant',
          content: "There was an error communicating with the coaching service. Please try again later.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const handleGetMaterials = async (topic) => {
    if (!topic || !sessionId) return;
    try {
      setLoading(true);
      const materials = await getCoachingMaterials(sessionId, topic);
      setActiveMaterial(materials);
    } catch (err) {
      console.error("Error fetching materials:", err);
      setError("Failed to load learning materials");
    } finally {
      setLoading(false);
    }
  };

  const handleSendDiagramToCoach = async () => {
    if (!diagramCode || !sessionId) return;
    const message = "Can you provide feedback on my system design diagram?";
    try {
      setIsSending(true);
      const newMessage = {
        id: Date.now(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(true);
      const contextInfo = {
        diagramContext: currentDiagramState,
        requestDiagramFeedback: true
      };
      const response = await sendCoachingMessage(sessionId, message, contextInfo);
      if (response?.message) {
        const botMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.message.content,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMessage]);
        setSession(prev => ({
          ...prev,
          conversation: [
            ...(prev.conversation || []),
            { role: 'user', content: message },
            { role: 'assistant', content: response.message.content }
          ]
        }));
        if (response.diagramSuggestions) {
          handleDiagramSuggestions(response.diagramSuggestions);
        }
      }
    } catch (err) {
      console.error("Error sending diagram for feedback:", err);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'system',
        content: 'Failed to get diagram feedback. Please try again.',
        error: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const handleDiagramSuggestions = (suggestions) => {
    if (!suggestions || !suggestions.mermaidCode) return;
    try {
      const { nodes: suggestedNodes, edges: suggestedEdges } = mermaidToReactFlow(suggestions.mermaidCode);
      const markedNodes = suggestedNodes.map(node => ({
        ...node,
        style: { ...node.style, border: '2px dashed #4f46e5' },
        data: { ...node.data, suggested: true }
      }));
      const markedEdges = suggestedEdges.map(edge => ({
        ...edge,
        style: { ...edge.style, strokeDasharray: '5,5', stroke: '#4f46e5' },
        data: { ...edge.data, suggested: true }
      }));
      setDiagramSuggestions({
        nodes: markedNodes,
        edges: markedEdges,
        mermaidCode: suggestions.mermaidCode
      });
      setShowSuggestions(true);
    } catch (err) {
      console.error("Error processing diagram suggestions:", err);
    }
  };

  const handleAcceptSuggestions = () => {
    if (!diagramSuggestions) return;
    const updatedNodes = [...nodes, ...diagramSuggestions.nodes.filter(
      sugNode => !nodes.some(node => node.id === sugNode.id)
    )];
    const updatedEdges = [...edges, ...diagramSuggestions.edges.filter(
      sugEdge => !edges.some(edge => edge.id === sugEdge.id)
    )];
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setDiagramCode(diagramSuggestions.mermaidCode);
    setCurrentDiagramState({
      nodes: updatedNodes,
      edges: updatedEdges,
      mermaidCode: diagramSuggestions.mermaidCode
    });
    setDiagramSuggestions(null);
    setShowSuggestions(false);
  };

  const handleDiscardSuggestions = () => {
    setDiagramSuggestions(null);
    setShowSuggestions(false);
  };

  const handleSaveDiagram = async () => {
    if (!sessionId) return;
    try {
      setIsSavingDiagram(true);
      const diagramData = {
        mermaidCode: diagramCode,
        reactFlowData: { nodes, edges }
      };
      await saveDiagram(sessionId, diagramData);
      setSession(prev => ({
        ...prev,
        diagram: diagramData
      }));
    } catch (err) {
      console.error("Error saving diagram:", err);
      setError("Failed to save diagram");
    } finally {
      setIsSavingDiagram(false);
    }
  };

  const handleGetDiagramSuggestion = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const suggestion = await getCoachingDiagram(sessionId);
      if (suggestion?.mermaidCode) {
        try {
          const { nodes: convertedNodes, edges: convertedEdges } = mermaidToReactFlow(suggestion.mermaidCode);
          const markedNodes = convertedNodes.map(node => ({
            ...node,
            style: { ...node.style, border: '2px dashed #4f46e5' },
            data: { ...node.data, suggested: true }
          }));
          const markedEdges = convertedEdges.map(edge => ({
            ...edge,
            style: { ...edge.style, strokeDasharray: '5,5', stroke: '#4f46e5' },
            data: { ...edge.data, suggested: true }
          }));
          setDiagramSuggestions({
            nodes: markedNodes,
            edges: markedEdges,
            mermaidCode: suggestion.mermaidCode
          });
          setShowSuggestions(true);
        } catch (err) {
          console.error("Error converting AI diagram:", err);
        }
      }
    } catch (err) {
      console.error("Error getting diagram suggestion:", err);
      setError("Failed to get diagram suggestion");
    } finally {
      setLoading(false);
    }
  };

  const onNodesChange = useCallback(
    (changes) => {
      setNodes(nds => {
        const updatedNodes = applyNodeChanges(changes, nds);
        try {
          const newDiagramCode = reactFlowToMermaid({ nodes: updatedNodes, edges });
          setDiagramCode(newDiagramCode);
          setCurrentDiagramState({ nodes: updatedNodes, edges, mermaidCode: newDiagramCode });
        } catch (err) {
          console.error("Error updating Mermaid code:", err);
        }
        return updatedNodes;
      });
    },
    [edges]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges(eds => {
        const updatedEdges = applyEdgeChanges(changes, eds);
        try {
          const newDiagramCode = reactFlowToMermaid({ nodes, edges: updatedEdges });
          setDiagramCode(newDiagramCode);
          setCurrentDiagramState({ nodes, edges: updatedEdges, mermaidCode: newDiagramCode });
        } catch (err) {
          console.error("Error updating Mermaid code:", err);
        }
        return updatedEdges;
      });
    },
    [nodes]
  );

  const onConnect = useCallback(
    (params) => {
      const newEdge = { ...params, id: `e${params.source}-${params.target}` };
      setEdges(eds => {
        const updatedEdges = addEdge(newEdge, eds);
        try {
          const newDiagramCode = reactFlowToMermaid({ nodes, edges: updatedEdges });
          setDiagramCode(newDiagramCode);
          setCurrentDiagramState({ nodes, edges: updatedEdges, mermaidCode: newDiagramCode });
        } catch (err) {
          console.error("Error updating Mermaid code:", err);
        }
        return updatedEdges;
      });
    },
    [nodes]
  );

  const handleDiagramUpdate = (diagramData) => {
    setCurrentDiagramState(diagramData);
  };

  const renderDiagramEditor = () => {
    if (viewMode === 'edit') {
      return (
        <div className="relative h-full">
          <ReactFlowDiagramWithProvider
            initialNodes={nodes}
            initialEdges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDiagramUpdate={handleDiagramUpdate}
          />
          {showSuggestions && diagramSuggestions && (
            <div className="absolute inset-0 bg-black bg-opacity-10 z-10 flex flex-col">
              <div className="bg-yellow-50 p-3 border-b border-yellow-200">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">AI has suggested diagram changes</span>
                  </p>
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleAcceptSuggestions}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded flex items-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept Changes
                    </button>
                    <button 
                      onClick={handleDiscardSuggestions}
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded flex items-center"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Discard
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 relative">
                <ReactFlowDiagramWithProvider
                  initialNodes={diagramSuggestions.nodes}
                  initialEdges={diagramSuggestions.edges}
                  onNodesChange={() => {}}
                  onEdgesChange={() => {}}
                  onConnect={() => {}}
                />
              </div>
            </div>
          )}
        </div>
      );
    } else if (viewMode === 'preview') {
      return <MermaidRenderer code={diagramCode} />;
    } else {
      return (
        <div className="h-full p-4 flex flex-col">
          <textarea
            value={diagramCode}
            onChange={e => setDiagramCode(e.target.value)}
            className="w-full flex-1 font-mono text-sm p-2 border border-gray-300 rounded"
          />
          <div className="mt-2">
            <button
              onClick={() => {
                try {
                  const { nodes: newNodes, edges: newEdges } = mermaidToReactFlow(diagramCode);
                  setNodes(newNodes);
                  setEdges(newEdges);
                  setViewMode('edit');
                } catch (err) {
                  console.error("Error parsing Mermaid code:", err);
                  alert("Invalid Mermaid code: " + err.message);
                }
              }}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
            >
              Apply Changes
            </button>
          </div>
        </div>
      );
    }
  };

  if (loading && !session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <div className="ml-3 text-gray-600">Loading session data...</div>
      </div>
    );
  }

  if (error && !session && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/coaching')}
              className="p-1 rounded-full hover:bg-gray-100 mr-2"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold">
              {session?.problem?.title || 'System Design Coaching'}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveDiagram}
              className={`flex items-center px-3 py-1 rounded text-sm ${
                isSavingDiagram
                  ? 'bg-gray-300 text-gray-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              disabled={isSavingDiagram}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSavingDiagram ? 'Saving...' : 'Save Progress'}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Chat */}
        <div className="w-1/2 flex flex-col border-r border-gray-200">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <TopicGuidedCoaching 
              currentTopic={currentTopic}
              onSendMessage={(question) => handleSendMessage(question)}
              onGetMaterials={handleGetMaterials}
            />
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={`p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-100 ml-auto max-w-md'
                      : msg.role === 'system'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-white border border-gray-200 max-w-lg'
                  } ${msg.error ? 'border-red-300 text-red-600' : ''}`}
                >
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <div className="rounded border border-gray-200 overflow-hidden my-2">
                            <div className="bg-gray-50 border-b border-gray-200 px-4 py-1 text-xs text-gray-500 font-mono">
                              {match[1]}
                            </div>
                            <pre className="bg-white p-4 overflow-auto text-sm">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          </div>
                        ) : (
                          <code className="font-mono text-sm bg-gray-50 px-1 py-0.5 rounded text-pink-600" {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No messages yet. Start by asking a question about system design.
              </div>
            )}
            {isTyping && (
              <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className="p-4 border-t border-gray-200">
            <div className="p-3 mb-3 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-center space-x-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={includeDiagram}
                    onChange={() => setIncludeDiagram(!includeDiagram)}
                  />
                  <span className="text-blue-700 font-medium">Include current diagram</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={requestDiagramSuggestions}
                    onChange={() => setRequestDiagramSuggestions(!requestDiagramSuggestions)}
                  />
                  <span className="text-blue-700 font-medium">Request diagram suggestions</span>
                </label>
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (messageInput.trim()) {
                  handleSendMessage(messageInput);
                  setMessageInput('');
                }
              }}
              className="flex"
            >
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSending}
              />
              <button
                type="submit"
                className={`px-4 py-2 rounded-r-md flex items-center justify-center ${
                  isSending
                    ? 'bg-gray-300 text-gray-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={isSending}
              >
                {isSending ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right panel - Diagram */}
        <div className="w-1/2 flex flex-col">
          <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <h2 className="text-md font-medium">System Design Diagram</h2>
              <div className="ml-4 flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('edit')}
                  className={`px-2 py-1 text-xs ${viewMode === 'edit' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-2 py-1 text-xs ${viewMode === 'preview' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setViewMode('code')}
                  className={`px-2 py-1 text-xs ${viewMode === 'code' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Code
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleGetDiagramSuggestion}
                className="flex items-center px-2 py-1 text-xs bg-gray-100 rounded border border-gray-300 hover:bg-gray-200"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                AI Suggest
              </button>
              <button
                onClick={handleSendDiagramToCoach}
                className="flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded border border-blue-300 hover:bg-blue-200"
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Get Feedback
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {renderDiagramEditor()}
          </div>
        </div>
      </div>

      {/* Learning materials modal */}
      {activeMaterial && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg max-w-3xl max-h-[80vh] w-full overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium text-lg">{activeMaterial.title}</h3>
              <button
                onClick={() => setActiveMaterial(null)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-8rem)]">
              <ReactMarkdown>{activeMaterial.content}</ReactMarkdown>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setActiveMaterial(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachingSessionPage;
