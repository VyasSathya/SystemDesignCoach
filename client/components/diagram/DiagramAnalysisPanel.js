import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { DiagramSuggestionManager } from './DiagramSuggestionManager';
import './styles/DiagramAnalysis.css';

const DiagramAnalysisPanel = ({ 
  nodes, 
  edges, 
  updateNodes, 
  updateEdges,
  onClose,
  sessionId 
}) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestionManager] = useState(
    () => new DiagramSuggestionManager(nodes, edges, updateNodes, updateEdges)
  );

  useEffect(() => {
    analyzeDiagram();
  }, [nodes, edges]);

  const analyzeDiagram = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/diagram/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          nodes,
          edges,
        }),
      });
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Failed to analyze diagram:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = async (suggestion) => {
    const success = suggestionManager.applySuggestion(suggestion);
    if (success) {
      // Re-analyze after applying suggestion
      await analyzeDiagram();
    }
  };

  const renderSuggestionCard = (suggestion) => {
    const priorityClass = `priority-${suggestion.priority}`;
    return (
      <div key={suggestion.id} className={`suggestion-card ${priorityClass}`}>
        <div className="suggestion-header">
          <span className="suggestion-type">{suggestion.type}</span>
          <span className="suggestion-priority">{suggestion.priority}</span>
        </div>
        <div className="suggestion-details">
          {suggestion.details}
        </div>
        {suggestion.benefits && (
          <div className="suggestion-benefits">
            <h4>Benefits:</h4>
            <ul>
              {suggestion.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}
        <button
          className="apply-suggestion-btn"
          onClick={() => handleApplySuggestion(suggestion)}
        >
          Apply Suggestion <ArrowRight size={16} />
        </button>
      </div>
    );
  };

  const renderAnalysisSection = (title, items, icon) => {
    if (!items?.length) return null;
    return (
      <div className="analysis-section">
        <h3 className="section-title">
          {icon}
          {title}
        </h3>
        {items.map(renderSuggestionCard)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="diagram-analysis">
        <div className="analysis-loading">
          Analyzing diagram...
        </div>
      </div>
    );
  }

  return (
    <div className="diagram-analysis">
      <div className="analysis-header">
        <h2>Diagram Analysis</h2>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      <div className="analysis-sections">
        {analysis?.score && (
          <div className="analysis-score">
            <h3>Overall Score</h3>
            <div className="score-value">{analysis.score}/100</div>
          </div>
        )}

        {renderAnalysisSection(
          "Critical Issues",
          analysis?.criticalIssues,
          <AlertTriangle className="text-red-500" size={20} />
        )}

        {renderAnalysisSection(
          "Suggestions",
          analysis?.suggestions,
          <CheckCircle className="text-green-500" size={20} />
        )}

        {renderAnalysisSection(
          "Best Practices",
          analysis?.bestPractices,
          <CheckCircle className="text-blue-500" size={20} />
        )}
      </div>
    </div>
  );
};

export default DiagramAnalysisPanel;