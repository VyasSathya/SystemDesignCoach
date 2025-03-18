import React from 'react';

const FeedbackStatus = ({ section, score, suggestions }) => {
  const getStatusColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  return (
    <div className="feedback-status">
      <div className={`status-indicator ${getStatusColor(score)}`}>
        <span className="score">{score}%</span>
      </div>
      <div className="quick-suggestions">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="suggestion-item">
            <span className="suggestion-icon">💡</span>
            <span className="suggestion-text">{suggestion}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackStatus;