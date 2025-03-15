import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, Check } from 'lucide-react';

const DiagramProgressView = ({ sessionId, diagramId }) => {
  const [progressData, setProgressData] = useState(null);
  const [activeTab, setActiveTab] = useState('scores');

  useEffect(() => {
    fetchProgressData();
  }, [sessionId, diagramId]);

  const fetchProgressData = async () => {
    try {
      const response = await fetch(`/api/diagrams/${diagramId}/progress?sessionId=${sessionId}`);
      const data = await response.json();
      setProgressData(data);
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    }
  };

  if (!progressData) {
    return <div>Loading progress data...</div>;
  }

  const formatSnapshotData = (snapshots) => {
    return snapshots.map((snapshot, index) => ({
      timestamp: new Date(snapshot.timestamp).toLocaleString(),
      ...snapshot.scores,
      complexity: snapshot.complexity.density,
      patterns: Object.values(snapshot.patterns).filter(Boolean).length,
    }));
  };

  const renderScoresChart = () => (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={formatSnapshotData(progressData.snapshots)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="overall" stroke="#8884d8" name="Overall" />
          <Line type="monotone" dataKey="scalability.value" stroke="#82ca9d" name="Scalability" />
          <Line type="monotone" dataKey="reliability.value" stroke="#ffc658" name="Reliability" />
          <Line type="monotone" dataKey="security.value" stroke="#ff7300" name="Security" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderPatternProgress = () => {
    const patterns = progressData.snapshots[progressData.snapshots.length - 1].patterns;
    
    return (
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(patterns).map(([pattern, implemented]) => (
          <div key={pattern} className={`p-4 rounded-lg border ${implemented ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
            <div className="flex items-center justify-between">
              <span className="capitalize">{pattern.replace(/([A-Z])/g, ' $1').trim()}</span>
              {implemented ? <Check className="text-green-500" /> : null}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderComplexityMetrics = () => {
    const latest = progressData.snapshots[progressData.snapshots.length - 1].complexity;
    
    return (
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(latest).map(([metric, value]) => (
          <div key={metric} className="p-4 rounded-lg border border-gray-300">
            <div className="text-sm text-gray-500 capitalize">{metric}</div>
            <div className="text-xl font-semibold">{value.toFixed(2)}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderRecommendations = () => {
    const recommendations = progressData.recommendations || [];
    
    return (
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className={`p-4 rounded-lg border ${
            rec.type === 'warning' ? 'border-yellow-500 bg-yellow-50' : 'border-blue-500 bg-blue-50'
          }`}>
            <div className="flex items-start gap-2">
              {rec.type === 'warning' ? (
                <AlertTriangle className="text-yellow-500" />
              ) : (
                <TrendingUp className="text-blue-500" />
              )}
              <div>
                <div className="font-semibold capitalize">{rec.category}</div>
                <div className="text-sm">{rec.message}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'scores' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('scores')}
        >
          Scores
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'patterns' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('patterns')}
        >
          Patterns
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'complexity' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('complexity')}
        >
          Complexity
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'recommendations' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          Recommendations
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'scores' && renderScoresChart()}
        {activeTab === 'patterns' && renderPatternProgress()}
        {activeTab === 'complexity' && renderComplexityMetrics()}
        {activeTab === 'recommendations' && renderRecommendations()}
      </div>
    </div>
  );
};

export default DiagramProgressView;