import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, Zap, Server, Tool } from 'lucide-react';
import './styles/ScorePanel.css';

const ScorePanel = ({ scores, improvements }) => {
  const categoryIcons = {
    security: <Shield size={20} />,
    scalability: <Zap size={20} />,
    reliability: <Server size={20} />,
    maintainability: <Tool size={20} />
  };

  const formatScoreData = () => {
    return Object.entries(scores).map(([category, data]) => ({
      name: category,
      score: data.value,
      factors: data.factors
    })).filter(item => item.name !== 'overall');
  };

  return (
    <div className="score-panel">
      <div className="overall-score">
        <h2>Overall Score</h2>
        <div className="score-circle">
          <span>{Math.round(scores.overall)}</span>
        </div>
      </div>

      <div className="category-scores">
        <h3>Category Breakdown</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={formatScoreData()}>
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="score" fill="#4CAF50" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="score-details">
        {Object.entries(scores).map(([category, data]) => {
          if (category === 'overall') return null;
          return (
            <div key={category} className="category-detail">
              <div className="category-header">
                {categoryIcons[category]}
                <h4>{category}</h4>
                <span className="category-score">{data.value}</span>
              </div>
              <ul className="factor-list">
                {data.factors.map((factor, index) => (
                  <li key={index}>{factor}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="improvement-plan">
        <h3>Improvement Plan</h3>
        
        <div className="timeline">
          <div className="timeline-section">
            <h4>Immediate Actions</h4>
            <ul>
              {improvements.immediate.map((item, index) => (
                <li key={index} className={`priority-${item.impact}`}>
                  <span className="action">{item.action}</span>
                  <span className="effort-tag">{item.effort}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="timeline-section">
            <h4>Short Term</h4>
            <ul>
              {improvements.shortTerm.map((item, index) => (
                <li key={index} className={`priority-${item.impact}`}>
                  <span className="action">{item.action}</span>
                  <span className="effort-tag">{item.effort}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="timeline-section">
            <h4>Long Term</h4>
            <ul>
              {improvements.longTerm.map((item, index) => (
                <li key={index} className={`priority-${item.impact}`}>
                  <span className="action">{item.action}</span>
                  <span className="effort-tag">{item.effort}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScorePanel;