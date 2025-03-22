'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { autoSave } from '../../utils/workbookStorage';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ErrorBoundary from '../../components/ErrorBoundary';
import Cookies from 'js-cookie';
import {
  ArrowLeft, Save, Send, RefreshCw, MessageSquare, CheckCircle, XCircle, 
  Eye, Edit, ClipboardList, Database, Code, Layout, TrendingUp, Shield, 
  ChevronDown, ChevronUp, FileText, Network
} from 'lucide-react';
import { ReactFlow, Background, Controls, ReactFlowProvider, 
  applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import {
  getCoachingSession, sendCoachingMessage, getCoachingMaterials,
  getCoachingDiagram, saveDiagram
} from '../../utils/api';
import { mermaidToReactFlow, reactFlowToMermaid } from '../../components/diagram/utils/conversion';
import TopicGuidedCoaching from '../../components/coaching/TopicGuidedCoaching';
import debounce from 'lodash/debounce';
import { workbookService } from '../../services/workbookService';
import { WorkbookProvider, useWorkbook } from '../../contexts/WorkbookContext';
import { AuthProvider } from '../../contexts/AuthContext';

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

const SystemArchitectureDiagram = dynamic(
  () => import('../../components/diagram/SystemArchitectureDiagram'),
  { ssr: false }
);

const SystemSequenceDiagram = dynamic(
  () => import('../../components/diagram/SystemSequenceDiagram'),
  { ssr: false }
);

const DiagramEditor = dynamic(
  () => import('../../components/diagram/DiagramEditor'),
  { ssr: false }
);

// Disable SSR for the entire page
const CoachingSessionWithNoSSR = dynamic(() => Promise.resolve(CoachingSessionContent), {
  ssr: false
});

// Main content component
function CoachingSessionContent({ id }) {
  // 1. Context hooks first
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { workbookState, setWorkbookState } = useWorkbook();

  // 2. State hooks
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeWorkbookTab, setActiveWorkbookTab] = useState('requirements');
  const [rightPanelMode, setRightPanelMode] = useState('workbook');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [diagramCode, setDiagramCode] = useState('');
  const [diagramSuggestions, setDiagramSuggestions] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 3. Memoized values
  const currentWorkbookState = useMemo(() => 
    workbookState || {
      requirements: { content: null, isDirty: false },
      api: { content: null, isDirty: false },
      data: { content: null, isDirty: false },
      architecture: { content: null, isDirty: false },
      scaling: { content: null, isDirty: false },
      reliability: { content: null, isDirty: false }
    }, 
    [workbookState]
  );

  // 4. Effects
  useEffect(() => {
    const authToken = Cookies.get('auth_token');
    if (!authLoading && !user && !authToken) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!id) return;
    
    async function fetchSession() {
      try {
        setIsLoading(true);
        const data = await getCoachingSession(id);
        setSession(data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching session:`, err);
        setError("Failed to load session");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSession();
  }, [id]);

  // 5. Callbacks
  const handleWorkbookUpdate = useCallback((section, data) => {
    setWorkbookState(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data,
        isDirty: true
      }
    }));
  }, [setWorkbookState]);

  // Loading states
  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>;
  }

  // Don't render while redirecting
  if (!user && !Cookies.get('auth_token')) {
    return null;
  }

  // 2. Ref hooks
  const workbookDropdownRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 3. State hooks
  const [mounted, setMounted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [includeDiagram, setIncludeDiagram] = useState(false);
  const [requestDiagramSuggestions, setRequestDiagramSuggestions] = useState(false);
  const [activeDiagramTab, setActiveDiagramTab] = useState('system');
  const [diagramState, setDiagramState] = useState({
    current: {
      nodes: [],
      edges: [],
      mermaidCode: ''
    },
    previous: null
  });
  const [topicGuidedOpen, setTopicGuidedOpen] = useState(true);
  const [currentTopic, setCurrentTopic] = useState('REQUIREMENTS');
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [workbookProgress, setWorkbookProgress] = useState(0);

  // Get sessionId from either the id prop or session state
  const sessionId = id || session?._id;

  // 4. Callback hooks
  const onNodesChange = useCallback((changes) => {
    setNodes(nds => {
      const updatedNodes = applyNodeChanges(changes, nds);
      try {
        const newDiagramCode = reactFlowToMermaid({ nodes: updatedNodes, edges });
        setDiagramCode(newDiagramCode);
        setDiagramState(prev => ({
          ...prev,
          current: { nodes: updatedNodes, edges, mermaidCode: newDiagramCode }
        }));
      } catch (err) {
        console.error("Error updating Mermaid code:", err);
      }
      return updatedNodes;
    });
  }, [edges]);

  const onEdgesChange = useCallback((changes) => {
    setEdges(eds => {
      const updatedEdges = applyEdgeChanges(changes, eds);
      try {
        const newDiagramCode = reactFlowToMermaid({ nodes, edges: updatedEdges });
        setDiagramCode(newDiagramCode);
        setDiagramState(prev => ({
          ...prev,
          current: { nodes, edges: updatedEdges, mermaidCode: newDiagramCode }
        }));
      } catch (err) {
        console.error("Error updating Mermaid code:", err);
      }
      return updatedEdges;
    });
  }, [nodes]);

  // 5. Effect hooks
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle diagram mode changes
  useEffect(() => {
    if (rightPanelMode === 'diagram' && diagramState.previous) {
      // Restore previous state when switching to diagram mode
      setNodes(diagramState.previous.nodes);
      setEdges(diagramState.previous.edges);
      setDiagramCode(diagramState.previous.mermaidCode);
    } else if (rightPanelMode !== 'diagram') {
      // Store current state when switching away from diagram mode
      setDiagramState(prev => ({
        ...prev,
        previous: {
          nodes,
          edges,
          mermaidCode: diagramCode
        }
      }));
    }
  }, [rightPanelMode, diagramState.previous, nodes, edges, diagramCode]);

  // Session loading effect
  useEffect(() => {
    if (!router.query.id) return;
    
    async function fetchSession() {
      try {
        setIsLoading(true);
        const data = await getCoachingSession(router.query.id);
        setSession(data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching session:`, err);
        setError("Failed to load session");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSession();
  }, [router.query.id]); // Add dependency array

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (workbookDropdownRef.current && !workbookDropdownRef.current.contains(event.target)) {
        setShowWorkbookDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Loading state
  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <div className="ml-3">Loading session...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => router.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

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

  // Helper function for tab styles
  const getTabStyle = (tabId) => {
    if (tabId === activeWorkbookTab) {
      switch (tabId) {
        case 'requirements':
          return 'bg-indigo-100 text-indigo-700';
        case 'api':
          return 'bg-green-100 text-green-700';
        case 'data':
          return 'bg-purple-100 text-purple-700';
        case 'architecture':
          return 'bg-blue-100 text-blue-700';
        case 'scaling':
          return 'bg-orange-100 text-orange-700';
        case 'reliability':
          return 'bg-red-100 text-red-700';
        default:
          return 'bg-gray-100 text-gray-700';
      }
    }
    return 'text-gray-600 hover:bg-gray-50';
  };

  // Define workbook tabs with proper icon rendering
  const workbookTabs = [
    {
      id: 'requirements',
      label: 'Requirements',
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 'api',
      label: 'API Design',
      icon: <Code className="h-5 w-5" />
    },
    {
      id: 'data',
      label: 'Data Model',
      icon: <Database className="h-5 w-5" />
    },
    {
      id: 'architecture',
      label: 'Architecture',
      icon: <Network className="h-5 w-5" />
    },
    {
      id: 'scaling',
      label: 'Scaling',
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: 'reliability',
      label: 'Reliability',
      icon: <Shield className="h-5 w-5" />
    }
  ];

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };

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
      setIsLoading(true);
      const materials = await getCoachingMaterials(sessionId, topic);
      setActiveMaterial(materials);
    } catch (err) {
      console.error("Error fetching materials:", err);
      setError("Failed to load learning materials");
    } finally {
      setIsLoading(false);
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
      setIsSaving(true);
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
      setIsSaving(false);
    }
  };

  const handleGetDiagramSuggestion = async () => {
    if (!sessionId) return;
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

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

  const renderDiagramEditor = () => {
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

  const calculateProgress = () => {
    const sections = Object.values(workbookState.sections);
    const completedSections = sections.filter(s => s.completed).length;
    return sections.length ? Math.round((completedSections / sections.length) * 100) : 0;
  };

  const getActiveWorkbookComponent = () => {
    switch (activeWorkbookTab) {
      case 'requirements':
        return <RequirementsPage 
          workbookState={currentWorkbookState} 
          onUpdate={handleDiagramUpdate}
        />;
      case 'api':
        return <APIDesignPage 
          workbookState={currentWorkbookState} 
          onUpdate={handleDiagramUpdate}
        />;
      case 'data':
        return <DataModelPage 
          workbookState={currentWorkbookState} 
          onUpdate={handleDiagramUpdate}
        />;
      case 'architecture':
        return <SystemArchitecturePage 
          workbookState={currentWorkbookState} 
          onUpdate={handleDiagramUpdate}
        />;
      case 'scaling':
        return <ScalingStrategyPage 
          workbookState={currentWorkbookState} 
          onUpdate={handleDiagramUpdate}
        />;
      case 'reliability':
        return <ReliabilitySecurityPage 
          workbookState={currentWorkbookState} 
          onUpdate={handleDiagramUpdate}
        />;
      default:
        return <div>Select a workbook section</div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">System Design Coaching</h1>
            </div>
            <div className="flex space-x-3">
              <button className="btn btn-primary">
                Save Progress
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Chat section */}
        <section className="w-1/2 flex flex-col border-r border-gray-200 bg-white">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`chat-message ${message.role === 'user' ? 'user-message ml-auto' : 'assistant-message'}`}
                >
                  <ReactMarkdown
                    className="prose prose-sm max-w-none"
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ))}
            </div>
          </div>

          {/* Message input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message..."
                rows={1}
              />
              <button
                type="submit"
                disabled={isSending}
                className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                  isSending
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSending ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Workbook section */}
        <section className="w-1/2 flex flex-col bg-white">
          <div className="border-b border-gray-200 p-4">
            <nav className="flex space-x-4">
              {workbookTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveWorkbookTab(tab.id)}
                  className={`btn ${activeWorkbookTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {rightPanelMode === 'diagram' ? (
              renderDiagramEditor()
            ) : (
              getActiveWorkbookComponent()
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

// Static props (will only be used when SSR is enabled)
export async function getStaticProps({ params }) {
  return {
    props: {
      id: params?.id || null
    }
  };
}

// Generate static paths (will only be used when SSR is enabled)
export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking'
  };
}

export default function CoachingSessionPage({ id }) {
  return (
    <ErrorBoundary>
      <WorkbookProvider>
        <CoachingSessionContent id={id} />
      </WorkbookProvider>
    </ErrorBoundary>
  );
}
