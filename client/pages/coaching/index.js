import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getCoachingProblems, startCoachingSession } from '../../utils/api';

export default function CoachingPage() {
  const router = useRouter();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      const data = await getCoachingProblems();
      console.log('Loaded problems:', data); // Debug log
      setProblems(data);
    } catch (err) {
      setError('Failed to load problems');
      console.error('Error loading problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (problemId) => {
    try {
      setLoading(true);
      const session = await startCoachingSession(problemId);
      router.push(`/coaching/${session._id}`);
    } catch (err) {
      setError('Failed to start session');
      console.error('Error starting session:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">System Design Coaching</h1>
      {problems.length === 0 ? (
        <div className="text-center text-gray-500">No problems available</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem) => (
            <div 
              key={problem.id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleStartSession(problem.id)}
            >
              <h2 className="text-xl font-semibold mb-2">{problem.title}</h2>
              <p className="text-gray-600 mb-4">{problem.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {problem.difficulty}
                </span>
                <span className="text-sm text-gray-500">
                  {problem.estimatedTime} mins
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
