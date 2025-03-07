import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Award, 
  BarChart2,
  MessageSquare,
  Clock
} from 'lucide-react';
import Sidebar from '../../../components/Sidebar';
import { getInterviewResults } from '../../../utils/api';

export default function InterviewResultsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated } = useAuth();
  const [results, setResults] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  // Fetch results when component mounts
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (id) {
      console.log("Fetching results for interview:", id);
      fetchResults();
    }
  }, [id, isAuthenticated, router]);

  // Function to fetch interview results
  const fetchResults = async () => {
    try {
      setLoading(true);
      
      // Make API call to get results
      console.log("Making API call to get results:", id);
      const data = await getInterviewResults(id);
      console.log("Received results data:", data);
      
      // If we get valid data, use it
      if (data && data.results) {
        setResults(data.results);
        setConversation(data.conversation || []);
      } else {
        // Otherwise, use mock results for development
        console.log("Using mock results data");
        setResults({
          requirementsScore: 8,
          scaleEstimationScore: 7,
          architectureScore: 8,
          componentDesignScore: 7,
          tradeoffsScore: 6,
          communicationScore: 9,
          overallScore: 7.5,
          feedback: "You did a good job of identifying key requirements and proposing a reasonable architecture. Your communication was clear and structured. To improve, consider exploring more trade-offs and edge cases in your design. You might also want to think more about how to handle very large scale scenarios, particularly around database sharding and caching strategies."
        });
        
        // Set mock conversation if needed
        if (!data || !data.conversation) {
          setConversation([
            {
              role: "interviewer",
              content: "Welcome to your system design interview. Today I'd like you to design a URL shortener service like TinyURL or bit.ly. We have about 45 minutes for this discussion. Could you start by telling me how you understand this problem and what key requirements we should consider?",
              stage: "introduction",
              timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
              role: "candidate",
              content: "I understand that we need to design a service that takes long URLs and creates shorter ones that redirect to the original URL when accessed. Key requirements would include the ability to generate unique short URLs, redirect efficiently, handle high traffic, and ensure the system is scalable and reliable.",
              stage: "introduction",
              timestamp: new Date(Date.now() - 3540000).toISOString()
            },
            {
              role: "interviewer",
              content: "Great start! Let's focus on clarifying the requirements. What functional and non-functional requirements do you think are important for a URL shortening service?",
              stage: "requirements",
              timestamp: new Date(Date.now() - 3500000).toISOString()
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      setError('Failed to load interview results. Please try again later.');
      
      // Use mock data even on error
      setResults({
        requirementsScore: 8,
        scaleEstimationScore: 7,
        architectureScore: 8,
        componentDesignScore: 7,
        tradeoffsScore: 6,
        communicationScore: 9,
        overallScore: 7.5,
        feedback: "You did a good job of identifying key requirements and proposing a reasonable architecture. Your communication was clear and structured. To improve, consider exploring more trade-offs and edge cases in your design."
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to determine color based on score
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Function to get appropriate icon based on score
  const getScoreIcon = (score) => {
    if (score >= 8) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 6) return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar activeTab="interviews" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading interview results...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !results) {
    return (
      <div className="flex h-screen">
        <Sidebar activeTab="interviews" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Results not found'}</p>
            <button 
              onClick={() => router.push('/interviews')}
              className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
              Back to Interviews
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main results UI
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab="interviews" />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Interview Results</h1>
            <p className="text-gray-600">
              Review your performance and feedback from your system design interview.
            </p>
          </div>
          
          {/* Results summary card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Overall Performance</h2>
                <p className="text-gray-600">
                  Your interview assessment and detailed feedback
                </p>
              </div>
              
              <div className="mt-4 lg:mt-0 flex items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-50 mr-4">
                  <span className="text-2xl font-bold text-indigo-600">
                    {results.overallScore}
                  </span>
                </div>
                <div>
                  <p className="font-medium">Overall Score</p>
                  <p className="text-sm text-gray-500">Out of 10</p>
                </div>
              </div>
            </div>
            
            {/* Detailed scores grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                <div className="mr-3">
                  {getScoreIcon(results.requirementsScore)}
                </div>
                <div>
                  <p className="font-medium">Requirements Gathering</p>
                  <p className={`${getScoreColor(results.requirementsScore)} font-medium`}>
                    {results.requirementsScore}/10
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                <div className="mr-3">
                  {getScoreIcon(results.scaleEstimationScore)}
                </div>
                <div>
                  <p className="font-medium">Scale Estimation</p>
                  <p className={`${getScoreColor(results.scaleEstimationScore)} font-medium`}>
                    {results.scaleEstimationScore}/10
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                <div className="mr-3">
                  {getScoreIcon(results.architectureScore)}
                </div>
                <div>
                  <p className="font-medium">Architecture Design</p>
                  <p className={`${getScoreColor(results.architectureScore)} font-medium`}>
                    {results.architectureScore}/10
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                <div className="mr-3">
                  {getScoreIcon(results.componentDesignScore)}
                </div>
                <div>
                  <p className="font-medium">Component Design</p>
                  <p className={`${getScoreColor(results.componentDesignScore)} font-medium`}>
                    {results.componentDesignScore}/10
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                <div className="mr-3">
                  {getScoreIcon(results.tradeoffsScore)}
                </div>
                <div>
                  <p className="font-medium">Trade-offs Analysis</p>
                  <p className={`${getScoreColor(results.tradeoffsScore)} font-medium`}>
                    {results.tradeoffsScore}/10
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                <div className="mr-3">
                  {getScoreIcon(results.communicationScore)}
                </div>
                <div>
                  <p className="font-medium">Communication</p>
                  <p className={`${getScoreColor(results.communicationScore)} font-medium`}>
                    {results.communicationScore}/10
                  </p>
                </div>
              </div>
            </div>
            
            {/* Feedback section */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Detailed Feedback</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">
                  {results.feedback}
                </p>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 border-t pt-6">
              <button
                onClick={() => router.push('/interviews')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Practice Another Problem
              </button>
              
              <button
                onClick={() => setActiveTab('conversation')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Review Conversation
              </button>
            </div>
          </div>
          
          {/* Conversation review tab */}
          {activeTab === 'conversation' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">Interview Conversation</h2>
              
              <div className="space-y-4">
                {conversation.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex ${msg.role === 'interviewer' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-3xl rounded-lg p-4 ${
                      msg.role === 'interviewer' 
                        ? 'bg-gray-50 border border-gray-200 text-gray-800' 
                        : 'bg-indigo-50 border border-indigo-200 text-gray-800'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {msg.role === 'interviewer' ? 'Interviewer' : 'You'} • {msg.stage} stage
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => setActiveTab('summary')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back to Results
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}