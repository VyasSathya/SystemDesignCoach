import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  ArrowLeft, Save, Send, RefreshCw, MessageSquare, CheckCircle, XCircle, Eye, Edit, 
  ClipboardList, Database, Code, Layout, BarChart, Shield, ChevronDown, ChevronUp
} from 'lucide-react';
import { ReactFlow, Background, Controls, ReactFlowProvider, 
  applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import { useAuth } from '../../contexts/AuthContext';
import {
  getCoachingSession, sendCoachingMessage, getCoachingMaterials,
  getCoachingDiagram, saveDiagram
} from '../../utils/api';
import { mermaidToReactFlow, reactFlowToMermaid } from '../../components/diagram/utils/conversion';
import TopicGuidedCoaching from '../../components/coaching/TopicGuidedCoaching';

// Import workbook components directly
import RequirementsPage from '../RequirementsPage';
import APIDesignPage from '../APIDesignPage';
import DataModelPage from '../DataModelPage';
import SystemArchitecturePage from '../SystemArchitecturePage';
import ScalingStrategyPage from '../ScalingStrategyPage';
import ReliabilitySecurityPage from '../ReliabilitySecurityPage';

const MermaidRenderer = dynamic(() => import('../../components/diagram/MermaidRenderer'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-100 h-full w-full"></div>
});

const SystemArchitectureDiagram = dynamic(() => import('../../components/diagram/SystemArchitectureDiagram'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>
  )
});

const SystemSequenceDiagram = dynamic(() => import('../../components/diagram/SystemSequenceDiagram'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>
  )
});

const CoachingSessionPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  
  // Safely extract session ID from router query
  const sessionId = router.query?.id;

  // All state declarations grouped together at the top
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [currentTopic, setCurrentTopic] = useState('REQUIREMENTS');
  const [includeDiagram, setIncludeDiagram] = useState(false);
  const [requestDiagramSuggestions, setRequestDiagramSuggestions] = useState(false);
  const [activeWorkbookTab, setActiveWorkbookTab] = useState('requirements');
  const [rightPanelMode, setRightPanelMode] = useState('workbook');

  // Add state for TopicGuidedCoaching collapsible section
  const [topicGuidedOpen, setTopicGuidedOpen] = useState(false);
  
  // Add dropdown reference
  const workbookDropdownRef = useRef(null);
  const [showWorkbookDropdown, setShowWorkbookDropdown] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Diagram state
  const [diagramState, setDiagramState] = useState({
    nodes: [],
    edges: [],
    mermaidCode: ''
  });
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [diagramCode, setDiagramCode] = useState(''); // Add this line
  const [viewMode, setViewMode] = useState('edit');
  const [currentDiagramState, setCurrentDiagramState] = useState(null);
  const [isSavingDiagram, setIsSavingDiagram] = useState(false);
  const [diagramSuggestions, setDiagramSuggestions] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Workbook state
  const [workbookState, setWorkbookState] = useState({
    // Section data
    requirements: {},
    api: {},
    data: {},
    architecture: {},
    scaling: {},
    reliability: {},
    // Diagram data
    diagrams: {
      system: {
        nodes: [],
        edges: [],
        mermaidCode: ''
      },
      sequence: {
        nodes: [],
        edges: [],
        mermaidCode: ''
      }
    }
  });

  // Update function for workbook sections
  const updateWorkbookState = (section, data) => {
    setWorkbookState(prev => ({
      ...prev,
      [section]: data
    }));
  };

  // Update function for diagrams
  const updateDiagramState = (diagramType, diagramData) => {
    setWorkbookState(prev => ({
      ...prev,
      diagrams: {
        ...prev.diagrams,
        [diagramType]: {
          ...diagramData,
          metadata: {
            lastUpdated: new Date(),
            version: 1,
            type: diagramType
          }
        }
      }
    }));
  };

  // Define workbook tabs
  const workbookTabs = [
    { id: 'requirements', label: 'Requirements', icon: <ClipboardList size={18} /> },
    { id: 'api', label: 'API', icon: <Code size={18} /> },
    { id: 'data', label: 'Data', icon: <Database size={18} /> },
    { id: 'architecture', label: 'Architecture', icon: <Layout size={18} /> },
    { id: 'scaling', label: 'Scaling', icon: <BarChart size={18} /> },
    { id: 'reliability', label: 'Reliability', icon: <Shield size={18} /> }
  ];
  
  // Define diagram tabs
  const [diagramTabs, setDiagramTabs] = useState([
    { id: 'systems', label: 'Systems Diagram', active: true },
    { id: 'sequence', label: 'Sequence Diagram', active: false }
  ]);
  
  const setActiveDiagramTab = (tabId) => {
    setDiagramTabs(diagramTabs.map(tab => ({
      ...tab,
      active: tab.id === tabId
    })));
  };

  // Update form data
  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };
  
  // Add click outside handler for workbook dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (workbookDropdownRef.current && !workbookDropdownRef.current.contains(event.target)) {
        setShowWorkbookDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [workbookDropdownRef]);

  // Load session data
  useEffect(() => {
    if (!sessionId) return;
    
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
        console.error(`Error fetching coaching session ${sessionId}:`, err);
        setError("Failed to load coaching session");
        setMessages([{
          id: 0,
          role: 'assistant',
          content: "Welcome to your system design coaching session. Let's get started!",
          timestamp: new Date().toISOString()
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);
  
  // Auto-scroll to bottom of messages
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
    try {
      const userMessage = {
        id: messages.length,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);

      const response = await sendCoachingMessage(sessionId, message, contextInfo);
      
      if (response?.message) {
        // Log response details in a cleaner format
        console.log("Processing coach response:", {
          messageId: messages.length + 1,
          role: response.message.role,
          timestamp: response.message.timestamp,
          hasDiagramSuggestions: !!response.diagramSuggestions
        });

        const responseMessage = {
          id: messages.length + 1,
          role: response.message.role === 'coach' ? 'assistant' : response.message.role,
          content: response.message.content,
          timestamp: response.message.timestamp
        };
        
        setMessages(prev => [...prev, responseMessage]);
        setSession(prev => ({
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
        }));

        if (response.diagramSuggestions) {
          handleDiagramSuggestions(response.diagramSuggestions);
        }
      }
    } catch (error) {
      console.error("Error handling message:", error);
    } finally {
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

    // Update all state at once
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setDiagramCode(diagramSuggestions.mermaidCode);
    
    // Update the current diagram state
    const newDiagramState = {
      nodes: updatedNodes,
      edges: updatedEdges,
      mermaidCode: diagramSuggestions.mermaidCode
    };
    
    setCurrentDiagramState(newDiagramState);
    
    // Update workbook state with the new diagram
    setWorkbookState(prev => ({
      ...prev,
      diagrams: {
        ...prev.diagrams,
        [currentDiagramType]: newDiagramState
      }
    }));

    // Clear suggestions
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
    const { type, nodes, edges, mermaidCode } = diagramData;
    
    setWorkbookState(prev => ({
      ...prev,
      diagrams: {
        ...prev.diagrams,
        [type]: {
          nodes,
          edges,
          mermaidCode,
          metadata: {
            lastUpdated: new Date(),
            version: 1,
            type
          }
        }
      }
    }));

    // Optionally auto-save after each update
    if (autoSave) {
      handleDiagramSave(type);
    }
  };

  const handleDiagramSave = async (diagramType) => {
    if (!sessionId) return;
    
    const currentDiagram = workbookState.diagrams?.[diagramType];
    
    try {
      setIsSaving(true);
      await saveDiagram(sessionId, diagramType, currentDiagram);
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving diagram:', error);
      // Handle error
    }
  };

  const [lastDiagramState, setLastDiagramState] = useState(null);

  useEffect(() => {
    // When switching back to diagram mode, restore the last state
    if (rightPanelMode === 'diagram' && lastDiagramState) {
      setNodes(lastDiagramState.nodes);
      setEdges(lastDiagramState.edges);
      setDiagramCode(lastDiagramState.mermaidCode);
    }
  }, [rightPanelMode]);

  useEffect(() => {
    // Store the current diagram state when switching away
    if (rightPanelMode !== 'diagram') {
      setLastDiagramState({
        nodes,
        edges,
        mermaidCode: diagramCode
      });
    }
  }, [rightPanelMode, nodes, edges, diagramCode]);

  const renderDiagramEditor = () => {
    const activeDiagramTab = diagramTabs.find(tab => tab.active)?.id || 'systems';
    
    // Use the correct edges from state
    const currentEdges = activeDiagramTab === 'sequence' 
      ? workbookState.diagrams.sequence.edges 
      : workbookState.diagrams.system.edges;

    if (activeDiagramTab === 'sequence') {
      return (
        <div className="relative h-full">
          <SystemSequenceDiagram 
            initialData={currentDiagramState}
            onDiagramUpdate={handleDiagramUpdate}
            sessionId={sessionId}
          />
        </div>
      );
    }
    
    return (
      <div className="relative h-full">
        <SystemArchitectureDiagram
          initialNodes={nodes}
          initialEdges={currentEdges}
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
              <SystemArchitectureDiagram
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
  };

  // Render active workbook component
  const getActiveWorkbookComponent = () => {
    const commonProps = {
      sessionId,
      onSaveAndContinue: () => {
        const currentIndex = workbookTabs.findIndex(tab => tab.id === activeWorkbookTab);
        const nextTab = workbookTabs[currentIndex + 1];
        if (nextTab) {
          setActiveWorkbookTab(nextTab.id);
        }
      }
    };

    return (
      <div className="flex flex-col h-full">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white rounded-lg shadow">
            {(() => {
              switch (activeWorkbookTab) {
                case 'requirements':
                  return <RequirementsPage {...commonProps} data={workbookState.requirements} updateData={(data) => updateWorkbookState('requirements', data)} />;
                case 'api':
                  return <APIDesignPage {...commonProps} data={workbookState.api} updateData={(data) => updateWorkbookState('api', data)} />;
                case 'data':
                  return <DataModelPage {...commonProps} data={workbookState.data} updateData={(data) => updateWorkbookState('data', data)} />;
                case 'architecture':
                  return <SystemArchitecturePage {...commonProps} data={workbookState.architecture} updateData={(data) => updateWorkbookState('architecture', data)} />;
                case 'scaling':
                  return <ScalingStrategyPage {...commonProps} data={workbookState.scaling} updateData={(data) => updateWorkbookState('scaling', data)} />;
                case 'reliability':
                  return <ReliabilitySecurityPage {...commonProps} data={workbookState.reliability} updateData={(data) => updateWorkbookState('reliability', data)} />;
                default:
                  return <RequirementsPage {...commonProps} data={workbookState.requirements} updateData={(data) => updateWorkbookState('requirements', data)} />;
              }
            })()}
          </div>
        </div>

        {/* Fixed bottom buttons */}
        <div className="border-t border-gray-200 p-4 bg-white flex justify-between items-center">
          <button className="flex items-center px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors">
            <MessageSquare size={16} className="mr-2" />
            Ask Coach
          </button>
          <button 
            onClick={commonProps.onSaveAndContinue}
            className="flex items-center px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Save size={16} className="mr-2" />
            Save & Continue
          </button>
        </div>
      </div>
    );
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
            <div className="mr-2">
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setRightPanelMode('workbook')}
                  className={`px-4 py-2 text-sm font-medium ${
                    rightPanelMode === 'workbook'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Workbook
                </button>
                <button
                  onClick={() => setRightPanelMode('diagram')}
                  className={`px-4 py-2 text-sm font-medium ${
                    rightPanelMode === 'diagram'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Diagram
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Chat */}
        <div className="w-1/2 flex flex-col border-r border-gray-200">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden">
              <div className="flex justify-between items-center cursor-pointer p-3 bg-indigo-50 border-b border-gray-200" 
                   onClick={() => setTopicGuidedOpen(!topicGuidedOpen)}>
                <h3 className="font-medium text-indigo-700">Topic Guided Coaching</h3>
                {topicGuidedOpen ? (
                  <ChevronUp className="h-5 w-5 text-indigo-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-indigo-600" />
                )}
              </div>
              {topicGuidedOpen && (
                <div className="p-3">
                  <TopicGuidedCoaching 
                    currentTopic={currentTopic}
                    onSendMessage={(question) => handleSendMessage(question)}
                    onGetMaterials={handleGetMaterials}
                  />
                </div>
              )}
            </div>
            
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
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
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
                  <span className="text-blue-700 font-medium">Include current design</span>
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
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (messageInput.trim()) {
                      handleSendMessage(messageInput);
                      setMessageInput('');
                    }
                  }
                }}
                placeholder="Type your message... (Shift+Enter for new line)"
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[40px] max-h-[120px] overflow-y-auto"
                disabled={isSending}
                rows={1}
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

        {/* Right panel - Diagram or Workbook */}
        <div className="w-1/2 flex flex-col h-full">
          {rightPanelMode === 'diagram' ? (
            <>
              {/* Diagram mode controls */}
              <div className="bg-white border-b border-gray-200 p-3">
                <div className="flex justify-between items-center">
                  {/* Diagram type tabs */}
                  <div className="flex space-x-4">
                    {diagramTabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveDiagramTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${
                          tab.active
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleSendDiagramToCoach}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Get Feedback
                  </button>
                </div>
              </div>
              {/* Diagram content - Keep mounted but hidden */}
              <div className="flex-1 overflow-hidden">
                {renderDiagramEditor()}
              </div>
            </>
          ) : (
            <div className="flex flex-col h-full">
              {/* Add Workbook Navigation Tabs */}
              <div className="bg-white border-b border-gray-200">
                <div className="flex space-x-1 p-2">
                  {workbookTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveWorkbookTab(tab.id)}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        (() => {
                          switch(tab.id) {
                            case 'requirements':
                              return activeWorkbookTab === tab.id 
                                ? 'bg-indigo-100 text-indigo-700' 
                                : 'text-gray-600 hover:bg-indigo-50';
                            case 'api':
                              return activeWorkbookTab === tab.id 
                                ? 'bg-green-100 text-green-700' 
                                : 'text-gray-600 hover:bg-green-50';
                            case 'data':
                              return activeWorkbookTab === tab.id 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'text-gray-600 hover:bg-purple-50';
                            case 'architecture':
                              return activeWorkbookTab === tab.id 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'text-gray-600 hover:bg-blue-50';
                            case 'scaling':
                              return activeWorkbookTab === tab.id 
                                ? 'bg-orange-100 text-orange-700' 
                                : 'text-gray-600 hover:bg-orange-50';
                            case 'reliability':
                              return activeWorkbookTab === tab.id 
                                ? 'bg-red-100 text-red-700' 
                                : 'text-gray-600 hover:bg-red-50';
                            default:
                              return activeWorkbookTab === tab.id 
                                ? 'bg-gray-100 text-gray-700' 
                                : 'text-gray-600 hover:bg-gray-50';
                          }
                        })()
                      }`}
                    >
                      {tab.icon}
                      <span className="ml-2">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Workbook Content */}
              <div className="flex-1 overflow-hidden">
                {getActiveWorkbookComponent()}
              </div>
            </div>
          )}
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
