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
function CoachingSessionPageComponent() {
  console.log("--- CoachingSessionPageComponent Rendering ---"); // Add log
  // 1. ALL Hooks must be called unconditionally at the top
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const workbookContextValue = useWorkbook(); // Might be null initially
  console.log(">>> CoachingSessionPageComponent: workbookContextValue:", workbookContextValue); // Add log
  
  // Ensure context is loaded before destructuring
  const state = workbookContextValue?.state;
  const dispatch = workbookContextValue?.dispatch;
  const isWorkbookInitialized = state?.isInitialized;
  console.log(">>> CoachingSessionPageComponent: isWorkbookInitialized:", isWorkbookInitialized); // Add log

  const id = router.query.id;
  
  // State hooks
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
  
  // Ref hooks
  const workbookDropdownRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Extract current problem ID and data for stable dependency
  const currentProblemId = state?.currentProblem;
  console.log(">>> CoachingSessionPageComponent: currentProblemId from state:", currentProblemId); // Add log
  const currentProblemData = state?.problems?.[currentProblemId];
  console.log(">>> CoachingSessionPageComponent: currentProblemData exists:", !!currentProblemData); // Add log

  // Create a stable dependency based on the *content* of the relevant data
  const relevantDataString = useMemo(() => {
    if (!currentProblemData) return null;
    // Stringify only the parts passed down via currentWorkbookState
    return JSON.stringify({
      sections: currentProblemData.sections,
      diagrams: currentProblemData.diagrams,
      progress: currentProblemData.progress
    });
  }, [currentProblemData]); // Depends on the problem data object reference

  // Memoized values - Depend on the stable stringified data + problem ID
  const currentWorkbookState = useMemo(() => {
    console.log('Recalculating currentWorkbookState based on string for problem:', currentProblemId);
    // Parse the data from the string only when the string changes
    const problemData = relevantDataString ? JSON.parse(relevantDataString) : null;
    return {
      requirements: problemData?.sections?.requirements || { content: null, isDirty: false },
      api: problemData?.sections?.api || { content: null, isDirty: false },
      data: problemData?.sections?.data || { content: null, isDirty: false },
      architecture: problemData?.sections?.architecture || { content: null, isDirty: false },
      scaling: problemData?.sections?.scaling || { content: null, isDirty: false },
      reliability: problemData?.sections?.reliability || { content: null, isDirty: false },
      diagrams: problemData?.diagrams || {},
      progress: problemData?.progress || {}
    };
  }, 
  [currentProblemId, relevantDataString] // Depend on ID and the stable *string* representation
  );
  
  // Effect hooks
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  useEffect(() => {
    const authToken = Cookies.get('auth_token');
    if (!mounted) return; // Wait for mount
    if (!authLoading && !user && !authToken) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router, mounted]);
  
  useEffect(() => {
    console.log('CoachingSessionPage: Session loading effect running for id:', id);
    // Wait for mount AND workbook initialization
    if (!id || !mounted || !isWorkbookInitialized) { 
      console.log(`CoachingSessionPage: Skipping session load (mounted: ${mounted}, isWorkbookInitialized: ${isWorkbookInitialized})`);
      return; 
    }
    
    async function fetchSession() {
      try {
        setIsLoading(true);
        const data = await getCoachingSession(id);
        setSession(data);
        if (data?.conversation) {
           setMessages(data.conversation.map((msg, index) => ({ ...msg, id: index })));
        }
        setError(null);
        
        // Set the current problem in the workbook context based on the URL ID
        console.log(`CoachingSessionPage: Dispatching SET_CURRENT_PROBLEM for id: ${id}`);
        dispatch({ type: 'SET_CURRENT_PROBLEM', problemId: id });
        
        // --- NOTE: We are NOT loading problem *data* here yet. --- 
        // --- That should happen separately, perhaps triggered by SET_CURRENT_PROBLEM --- 

      } catch (err) {
        console.error(`Error fetching session:`, err);
        setError("Failed to load session");
      } finally {
        setIsLoading(false); // Set loading false after session info (like messages) is fetched
      }
    }
    fetchSession();
  }, [id, mounted, dispatch, isWorkbookInitialized]);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (workbookDropdownRef.current && !workbookDropdownRef.current.contains(event.target)) {
        setShowWorkbookDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Callback hooks
  const handleWorkbookUpdate = useCallback((section, data) => {
    if (!currentProblemId) return;
    console.log(`Dispatching UPDATE_SECTION_DATA for section: ${section}`);
    dispatch({
      type: 'UPDATE_SECTION_DATA',
      problemId: currentProblemId,
      section: section,
      data: data
    });
  }, [dispatch, currentProblemId]);
  
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
  
  // --- Early returns can only happen AFTER all hooks ---
  
  // Add a loading state based on workbook initialization & auth
  if (!isWorkbookInitialized || authLoading) {
      console.log(`--- CoachingSessionPageComponent showing initial loading state (isWorkbookInitialized: ${isWorkbookInitialized}, authLoading: ${authLoading}) ---`);
      return <div className="flex justify-center items-center h-screen">Initializing Workbook...</div>;
  }
  
  // Add a loading state while fetching the basic session info (like messages)
  if (isLoading) { 
      console.log(`--- CoachingSessionPageComponent showing session loading state (isLoading: ${isLoading}) ---`);
      return <div className="flex justify-center items-center h-screen">Loading Session Info...</div>;
  }
  
  // Add a check AFTER initialization and session load, but BEFORE rendering main content that needs the ID
  if (!currentProblemId) {
      console.log(`--- CoachingSessionPageComponent showing waiting state (currentProblemId: ${currentProblemId}) ---`);
      // This might happen if the SET_CURRENT_PROBLEM action hasn't completed yet
      // or if the id from the route is missing/invalid
      return <div className="flex justify-center items-center h-screen">Waiting for Problem ID...</div>;
  }

  console.log("--- CoachingSessionPageComponent Rendering MAIN CONTENT --- Key data:", { currentProblemId, activeWorkbookTab }); // Add log
  
  // Auth redirect check (can stay)
  if (!user && !Cookies.get('auth_token')) {
    // This might happen briefly before redirect effect runs
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /><span className="ml-3">Redirecting...</span></div>; // Show redirecting state
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
  
  // --- Component Render Logic --- 
  const sessionId = id || session?._id;
  
  // Update function for diagrams - use specific UPDATE_DIAGRAM action if exists, else UPDATE_SECTION_DATA
  const updateDiagramState = (diagramType, diagramData) => {
    if (!currentProblemId) return;
    console.log(`Dispatching update for diagram: ${diagramType}`);
    // Assuming UPDATE_SECTION_DATA can handle diagram updates under problems[problemId].diagrams[diagramType]
    // If not, a dedicated UPDATE_DIAGRAM action might be better.
    dispatch({
      type: 'UPDATE_SECTION_DATA', // Or 'UPDATE_DIAGRAM' if exists
      problemId: currentProblemId,
      section: 'diagrams', // Target the diagrams object
      subSection: diagramType, // Specify which diagram
      data: { // Send the full diagram data structure
         ...diagramData, 
         metadata: { ...(diagramData.metadata || {}), lastUpdated: new Date() } 
      }
    });
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
    dispatch({
      type: 'UPDATE_SECTION_DATA',
      problemId: currentProblemId,
      section: section,
      data: data
    });
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
        diagramContext: diagramState.current,
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
    
    setDiagramState(prev => ({
      ...prev,
      current: newDiagramState
    }));

    // Update workbook state with the new diagram
    updateDiagramState('system', newDiagramState);

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
    
    updateDiagramState(type, {
      nodes,
      edges,
      mermaidCode,
      metadata: {
        lastUpdated: new Date(),
        version: 1,
        type
      }
    });

    // Optionally auto-save after each update
    if (autoSave) {
      handleDiagramSave(type);
    }
  };

  const handleDiagramSave = async (diagramType) => {
    if (!sessionId) return;
    
    const currentDiagram = state.diagrams?.[diagramType];
    
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
            initialData={diagramState.current}
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
    const sections = Object.values(state.sections);
    const completedSections = sections.filter(s => s.completed).length;
    return sections.length ? Math.round((completedSections / sections.length) * 100) : 0;
  };

  const getActiveWorkbookComponent = () => {
    console.log(`>>> getActiveWorkbookComponent called. Active Tab: ${activeWorkbookTab}, Problem ID: ${currentProblemId}`); // Add log
    // Add a check here to ensure data is ready for the *specific* component
    if (!currentProblemData) {
       console.log(`>>> Waiting for data for problem ${currentProblemId} before rendering ${activeWorkbookTab}`); // Add log
       // Optionally dispatch a LOAD_PROBLEM_DATA action here if needed
       // Example: dispatch({ type: 'LOAD_PROBLEM_DATA', problemId: currentProblemId });
       return <div>Loading {activeWorkbookTab} data...</div>; // Show loading specific to the tab
    }
    
    // Pass the whole context value down as a prop
    switch (activeWorkbookTab) {
      case 'requirements': return <RequirementsPage contextValue={workbookContextValue} onUpdate={handleDiagramUpdate} />; // Pass contextValue
      case 'api': return <APIDesignPage contextValue={workbookContextValue} onUpdate={handleDiagramUpdate} />; // Pass contextValue
      case 'data': return <DataModelPage contextValue={workbookContextValue} onUpdate={handleDiagramUpdate} />; // Pass contextValue
      case 'architecture': return <SystemArchitecturePage contextValue={workbookContextValue} onUpdate={handleDiagramUpdate} />; // Pass contextValue
      case 'scaling': return <ScalingStrategyPage contextValue={workbookContextValue} onUpdate={handleDiagramUpdate} />; // Pass contextValue
      case 'reliability': return <ReliabilitySecurityPage contextValue={workbookContextValue} onUpdate={handleDiagramUpdate} />; // Pass contextValue
      default: return <div>Select a workbook section</div>;
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
                  className={`chat-message ${message.role === 'user' ? 'user-message ml-auto' : 'assistant-message'} prose prose-sm max-w-none`}
                >
                  <ReactMarkdown
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

// Export the main component function directly
// export default function CoachingSessionPage() { 
//   // ... (previous empty function)
// }
export default CoachingSessionPageComponent; // Export the actual component
