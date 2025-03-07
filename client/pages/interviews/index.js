import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../../components/Sidebar';
import { Activity, Clock, Users, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getInterviewProblems, startInterview } from '../../utils/api';

export default function InterviewsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [starting, setStarting] = useState(false);

  // Check authentication and fetch problems when component mounts
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (isAuthenticated) {
      fetchProblems();
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch problem data from API with debugging
  const fetchProblems = async () => {
    try {
      setLoading(true);
      const data = await getInterviewProblems();
      console.log("API Response:", data); // Debug the API response
      
      // Handle both possible data structures
      if (data && data.problems) {
        setProblems(data.problems);
      } else if (Array.isArray(data)) {
        setProblems(data);
      } else {
        // Fallback to hardcoded problems if API returns unexpected format
        setProblems([
          {
            id: "url-shortener",
            title: "Design a URL Shortener",
            difficulty: "intermediate",
            description: "Create a service that takes long URLs and creates unique short URLs, similar to TinyURL or bit.ly.",
            estimatedTime: 45
          },
          {
            id: "social-feed",
            title: "Design a Social Media Feed",
            difficulty: "advanced",
            description: "Design a news feed system that can handle millions of users posting and viewing content in real-time.",
            estimatedTime: 60
          },
          {
            id: "distributed-cache",
            title: "Design a Distributed Cache",
            difficulty: "intermediate",
            description: "Design a distributed caching system that can scale to handle high traffic and provide fast access to frequently used data.",
            estimatedTime: 50
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
      setError('Failed to load interview problems. Using demo problems instead.');
      
      // Set fallback problems on error
      setProblems([
        {
          id: "url-shortener",
          title: "Design a URL Shortener",
          difficulty: "intermediate",
          description: "Create a service that takes long URLs and creates unique short URLs, similar to TinyURL or bit.ly.",
          estimatedTime: 45
        },
        {
          id: "social-feed",
          title: "Design a Social Media Feed",
          difficulty: "advanced",
          description: "Design a news feed system that can handle millions of users posting and viewing content in real-time.",
          estimatedTime: 60
        },
        {
          id: "distributed-cache",
          title: "Design a Distributed Cache",
          difficulty: "intermediate",
          description: "Design a distributed caching system that can scale to handle high traffic and provide fast access to frequently used data.",
          estimatedTime: 50
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle starting a new interview
  const handleStartInterview = async (problemId) => {
    try {
      setStarting(true);
      const response = await startInterview(problemId);
      
      // Determine the ID to use for navigation
      const interviewId = response?.interview?.id || "1";
      router.push(`/interviews/${interviewId}`);
    } catch (error) {
      console.error('Error starting interview:', error);
      setError('Failed to start interview. Please try again later.');
      
      // On error, still navigate to a demo interview
      router.push('/interviews/1');
      setStarting(false);
    }
  };

  // Show problem details when a card is clicked
  const openProblemDetails = (problem) => {
    setSelectedProblem(problem);
  };

  // Close the problem details modal
  const closeProblemDetails = () => {
    setSelectedProblem(null);
  };

  // Loading state while fetching problems
  if (isLoading || loading) {
    return (
      <div className="flex h-screen">
        <Sidebar activeTab="interviews" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading interview problems...</p>
          </div>
        </div>
      </div>
    );
  }

  // Now log the current problems to debug
  console.log("Problems state before render:", problems);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab="interviews" />
      
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Practice Interviews</h1>
            <p className="text-gray-600">
              Select a system design problem to start a simulated interview session. Each interview will guide you through the key aspects of system design.
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems && problems.length > 0 ? (
              // Map through actual problems if available
              problems.map((problem, index) => (
                <div 
                  key={problem.id || index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openProblemDetails(problem)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">{problem.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      problem.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      problem.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {problem.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{problem.estimatedTime} minutes</span>
                    </div>
                    <span>Google, Amazon</span>
                  </div>
                </div>
              ))
            ) : (
              // Show placeholder cards if no problems found
              Array.from({ length: 3 }).map((_, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openProblemDetails({
                    id: index === 0 ? "url-shortener" : index === 1 ? "social-feed" : "distributed-cache",
                    title: index === 0 ? "Design a URL Shortener" : index === 1 ? "Design a Social Media Feed" : "Design a Distributed Cache",
                    difficulty: index === 0 ? "intermediate" : index === 1 ? "advanced" : "intermediate",
                    description: index === 0 
                      ? "Create a service that takes long URLs and creates unique short URLs, similar to TinyURL or bit.ly." 
                      : index === 1 
                      ? "Design a news feed system that can handle millions of users posting and viewing content in real-time." 
                      : "Design a distributed caching system that can scale to handle high traffic and provide fast access to frequently used data.",
                    estimatedTime: index === 0 ? 45 : index === 1 ? 60 : 50
                  })}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">
                      {index === 0 ? "Design a URL Shortener" : 
                      index === 1 ? "Design a Social Media Feed" : 
                      "Design a Distributed Cache"}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      {index === 0 ? "Intermediate" : index === 1 ? "Advanced" : "Intermediate"}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    {index === 0 ? "Create a service that takes long URLs and creates unique short URLs, similar to TinyURL or bit.ly." :
                    index === 1 ? "Design a news feed system that can handle millions of users posting and viewing content in real-time." :
                    "Design a distributed caching system that can scale to handle high traffic and provide fast access to frequently used data."}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{index === 0 ? "45" : index === 1 ? "60" : "50"} minutes</span>
                    </div>
                    <span>{index === 0 ? "Google, Uber" : index === 1 ? "Facebook, Twitter" : "Amazon, Netflix"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Problem Detail Modal */}
      {selectedProblem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{selectedProblem.title}</h2>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedProblem.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  selectedProblem.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {selectedProblem.difficulty.charAt(0).toUpperCase() + selectedProblem.difficulty.slice(1)}
                </span>
              </div>
              
              <p className="text-gray-600 mb-6">
                {selectedProblem.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium">Duration</span>
                  </div>
                  <p className="text-gray-600">{selectedProblem.estimatedTime} minutes</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Activity className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium">Focus Areas</span>
                  </div>
                  <p className="text-gray-600">Scalability, Data modeling, APIs</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">Interview Guidance</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Think out loud throughout the interview</li>
                  <li>• Ask clarifying questions before diving into solutions</li>
                  <li>• Consider trade-offs in your design decisions</li>
                  <li>• Focus on high-level architecture first, then dive deeper</li>
                </ul>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={closeProblemDetails}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStartInterview(selectedProblem.id)}
                  disabled={starting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
                >
                  {starting ? 'Starting...' : 'Start Interview'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}