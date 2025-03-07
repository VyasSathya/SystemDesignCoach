// client/pages/coaching/index.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight, School } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { getCoachingProblems, startCoachingSession } from '../../utils/api';

export default function CoachingIndexPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingSession, setStartingSession] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    fetchProblems();
  }, [isAuthenticated, router]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const data = await getCoachingProblems();
      
      if (data && data.problems) {
        setProblems(data.problems);
      }
    } catch (error) {
      console.error('Error fetching coaching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (problemId) => {
    try {
      setStartingSession(true);
      const response = await startCoachingSession(problemId);
      
      if (response && response.session) {
        router.push(`/coaching/${response.session._id}`);
      }
    } catch (error) {
      console.error('Error starting coaching session:', error);
    } finally {
      setStartingSession(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab="coaching" />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">System Design Coach</h1>
          <p className="text-gray-600 mt-1">Learn system design concepts with guided coaching sessions.</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center mt-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map(problem => (
              <div 
                key={problem.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{problem.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      problem.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      problem.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{problem.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <School className="h-4 w-4 mr-1" />
                      <span>{problem.estimatedTime} mins</span>
                    </div>
                    <button
                      onClick={() => handleStartSession(problem.id)}
                      disabled={startingSession}
                      className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Start learning
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}