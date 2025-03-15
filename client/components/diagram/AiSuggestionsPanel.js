import React, { useState, useEffect } from 'react';
import { Lightbulb, Plus, AlertTriangle, X } from 'lucide-react';
import './styles/AiSuggestions.css';

const AiSuggestionsPanel = ({
  diagram,
  onClose,
  onApplySuggestion,
  sessionId
}) => {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  useEffect(() => {
    fetchSuggestions();
  }, [diagram]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/diagram/suggest', {
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
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = (change) => {
    setSelectedSuggestion(change);
    onApplySuggestion(change);
  };

  const renderImmediateActions = (actions) => {
    if (!actions?.length) return null;

    return (
      <div className="immediate-actions">
        <h3>Recommended Actions</h3>
        <div className="actions-list">
          {actions.map((action, index) => (
            <div key={index} className={`action-card priority-${action.priority}`}>
              <div className="action-header">
                <AlertTriangle size={16} />
                <span className="action-type">{action.type}</span>
              </div>
              <p>{action.action}</p>
              <button 
                onClick={() => handleApplySuggestion({
                  type: 'add_node',
                  nodeType: action.nodeType
                })}
                className="apply-action"
              >
                <Plus size={16} />
                Apply
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAiSuggestions = (aiSuggestions) => {
    if (!aiSuggestions?.length) return null;

    return (
      <div className="ai-suggestions">
        <h3>AI Suggestions</h3>
        <div className="suggestions-list">
          {aiSuggestions.map((suggestion, index) => (
            <div key={index} className="suggestion-card">
              <div className="suggestion-header">
                <Lightbulb size={16} />
                <span>{suggestion.title}</span>
              </div>
              <p>{suggestion.description}</p>
              <div className="suggestion-benefits">
                {suggestion.benefits.map((benefit, i) => (
                  <span key={i} className="benefit-tag">{benefit}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProposedChanges = (changes) => {
    if (!changes?.length) return null;

    return (
      <div className="proposed-changes">
        <h3>Proposed Changes</h3>
        <div className="changes-list">
          {changes.map((change, index) => (
            <div key={index} className="change-card">
              <div className="change-header">
                <span>{change.type === 'add_node' ? 'Add Component' : 'Modify Structure'}</span>
              </div>
              <div className="change-details">
                {change.type === 'add_node' && (
                  <>
                    <p>Add {change.nodeType} component</p>
                    <p>Connects to: {change.connections.join(', ')}</p>
                  </>
                )}
              </div>
              <button 
                onClick={() => handleApplySuggestion(change)}
                className="apply-change"
              >
                Apply Change
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="ai-suggestions-panel">
        <div className="suggestions-loading">
          Analyzing diagram and generating suggestions...
        </div>
      </div>
    );
  }

  return (
    <div className="ai-suggestions-panel">
      <div className="suggestions-header">
        <h2>AI Suggestions</h2>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {suggestions && (
        <div className="suggestions-content">
          {renderImmediateActions(suggestions.immediateActions)}
          {renderAiSuggestions(suggestions.aiSuggestions)}
          {renderProposedChanges(suggestions.proposedChanges)}
        </div>
      )}
    </div>
  );
};

export default AiSuggestionsPanel;