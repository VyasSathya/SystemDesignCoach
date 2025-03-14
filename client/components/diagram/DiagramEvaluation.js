import React, { useState, useEffect } from 'react';
import { BarChart, CheckCircle, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

const CriterionCard = ({ title, score, previousScore, feedback, suggestions }) => {
  const improvement = score - (previousScore || 0);
  const Arrow = improvement >= 0 ? ArrowUp : ArrowDown;
  const arrowColor = improvement >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">{Math.round(score * 100)}%</span>
          {previousScore && (
            <Arrow className={`w-4 h-4 ${arrowColor}`} />
          )}
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-2">{feedback}</p>
      {suggestions?.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-semibold text-gray-500">Suggestions:</p>
          <ul className="text-xs text-gray-600 list-disc list-inside">
            {suggestions.map((suggestion, i) => (
              <li key={i}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const ProgressChart = ({ evaluationHistory }) => {
  if (!evaluationHistory?.length) return null;

  const data = evaluationHistory.map(eval => ({
    date: new Date(eval.timestamp).toLocaleDateString(),
    score: Math.round(eval.overallScore * 100)
  })).reverse();

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="font-semibold text-gray-700 mb-4">Progress Over Time</h3>
      <div className="h-40 relative">
        {/* Simple bar chart implementation */}
        <div className="flex items-end justify-between h-full">
          {data.map((point, i) => (
            <div key={i} className="flex flex-col items-center w-1/6">
              <div 
                className="w-4 bg-blue-500 rounded-t"
                style={{ height: `${point.score}%` }}
              />
              <span className="text-xs text-gray-500 mt-1 rotate-45 origin-left">
                {point.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DiagramEvaluation = ({ 
  sessionId, 
  evaluation, 
  previousEvaluation,
  onClose 
}) => {
  const [evaluationHistory, setEvaluationHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvaluationHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/sessions/${sessionId}/evaluations`);
        const data = await response.json();
        setEvaluationHistory(data);
      } catch (error) {
        console.error('Failed to fetch evaluation history:', error);
      }
      setLoading(false);
    };

    if (sessionId) {
      fetchEvaluationHistory();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const overallScore = Math.round(evaluation?.overallScore * 100);
  const previousOverallScore = previousEvaluation ? 
    Math.round(previousEvaluation.overallScore * 100) : null;
  const improvement = previousOverallScore ? 
    overallScore - previousOverallScore : null;

  return (
    <div className="bg-gray-50 p-6 rounded-lg max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Diagram Evaluation</h2>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Overall Score</p>
            <p className="text-2xl font-bold text-blue-600">{overallScore}%</p>
            {improvement && (
              <p className={`text-sm ${improvement >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {improvement > 0 ? '+' : ''}{improvement}%
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <ProgressChart evaluationHistory={evaluationHistory} />

      <div className="space-y-4">
        {Object.entries(evaluation.scores).map(([criterion, score]) => (
          <CriterionCard
            key={criterion}
            title={criterion.replace(/([A-Z])/g, ' $1').trim()}
            score={score}
            previousScore={previousEvaluation?.scores[criterion]}
            feedback={evaluation.feedback[criterion]}
            suggestions={evaluation.suggestions.filter(s => 
              s.toLowerCase().includes(criterion.toLowerCase())
            )}
          />
        ))}
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-700 mb-2">Key Improvements Needed</h3>
        <ul className="list-disc list-inside text-blue-600 space-y-1">
          {evaluation.suggestions.slice(0, 3).map((suggestion, i) => (
            <li key={i} className="text-sm">{suggestion}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DiagramEvaluation;