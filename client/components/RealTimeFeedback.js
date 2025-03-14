import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'react-feather';

const RealTimeFeedback = ({ section, content, onFeedback }) => {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const debounceTimeout = setTimeout(async () => {
      if (!content) return;
      
      setLoading(true);
      try {
        const response = await fetch('/api/evaluate/section', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section, content })
        });
        
        const data = await response.json();
        setFeedback(data);
        onFeedback?.(data);
      } catch (error) {
        console.error('Feedback error:', error);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(debounceTimeout);
  }, [content, section]);

  if (!feedback && !loading) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white shadow-lg rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        {loading ? (
          <AlertTriangle className="text-yellow-500" />
        ) : feedback?.score > 80 ? (
          <CheckCircle className="text-green-500" />
        ) : (
          <AlertCircle className="text-red-500" />
        )}
        <h3 className="font-semibold">
          {loading ? 'Analyzing...' : 'Feedback'}
        </h3>
      </div>
      
      {!loading && feedback && (
        <>
          <div className="mb-2">
            <div className="flex justify-between">
              <span>Quality Score</span>
              <span className="font-bold">{feedback.score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 rounded-full h-2" 
                style={{ width: `${feedback.score}%` }}
              />
            </div>
          </div>

          {feedback.suggestions?.length > 0 && (
            <div className="mt-2">
              <h4 className="font-medium mb-1">Suggestions:</h4>
              <ul className="text-sm text-gray-600">
                {feedback.suggestions.slice(0, 3).map((suggestion, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <span>•</span> {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RealTimeFeedback;