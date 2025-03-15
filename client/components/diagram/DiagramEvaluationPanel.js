import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, TrendingUp, Shield, Zap } from 'lucide-react';
import './styles/DiagramEvaluation.css';

const DiagramEvaluationPanel = ({
  diagram,
  onClose,
  sessionId
}) => {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    evaluateDiagram();
  }, [diagram]);

  const evaluateDiagram = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/diagram/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          diagram,
        }),
      });
      const data = await response.json();
      setEvaluation(data);
    } catch (error) {
      console.error('Failed to evaluate diagram:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderScoreCard = (criterion, score) => {
    const getScoreColor = (score) => {
      if (score >= 80) return 'text-green-500';
      if (score >= 60) return 'text-yellow-500';
      return 'text-red-500';
    };

    const getScoreIcon = (criterion) => {
      switch (criterion) {
        case 'scalability': return <TrendingUp size={20} />;
        case 'security': return <Shield size={20} />;
        case 'performance': return <Zap size={20} />;
        default: return <CheckCircle size={20} />;
      }
    };

    return (
      <div className={`score-card ${getScoreColor(score)}`}>
        <div className="score-header">
          {getScoreIcon(criterion)}
          <h4>{criterion.charAt(0).toUpperCase() + criterion.slice(1)}</h4>
        </div>
        <div className="score-value">{Math.round(score)}/100</div>
      </div>
    );
  };

  const renderPatterns = (patterns) => {
    if (!patterns?.length) return null;
    return (
      <div className="patterns-section">
        <h3>Identified Patterns</h3>
        <div className="patterns-grid">
          {patterns.map(pattern => (
            <div key={pattern} className="pattern-card">
              {pattern.replace(/-/g, ' ').charAt(0).toUpperCase() + pattern.slice(1)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRecommendations = (recommendations) => {
    if (!recommendations?.length) return null;
    return (
      <div className="recommendations-section">
        <h3>Recommendations</h3>
        {recommendations.map((rec, index) => (
          <div key={index} className={`recommendation-card priority-${rec.priority}`}>
            <div className="recommendation-header">
              <span className="category">{rec.category}</span>
              <span className="priority">{rec.priority}</span>
            </div>
            <div className="recommendation-body">
              <p>{rec.suggestion.suggestion}</p>
              <div className="details">
                <p>{rec.suggestion.details}</p>
                <ul>
                  {rec.suggestion.implementation.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="diagram-evaluation">
        <div className="evaluation-loading">
          Evaluating diagram...
        </div>
      </div>
    );
  }

  return (
    <div className="diagram-evaluation">
      <div className="evaluation-header">
        <h2>Diagram Evaluation</h2>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {evaluation && (
        <div className="evaluation-content">
          <div className="scores-grid">
            {Object.entries(evaluation.scores).map(([criterion, score]) => (
              criterion !== 'overall' && renderScoreCard(criterion, score)
            ))}
          </div>

          <div className="overall-score">
            <h3>Overall Score</h3>
            <div className="score-value">{Math.round(evaluation.scores.overall)}/100</div>
          </div>

          {renderPatterns(evaluation.patterns)}
          {renderRecommendations(evaluation.recommendations)}
        </div>
      )}
    </div>
  );
};

export default DiagramEvaluationPanel;