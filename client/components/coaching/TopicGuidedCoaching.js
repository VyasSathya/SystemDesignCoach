// client/components/coaching/TopicGuidedCoaching.js
import React, { useState, useEffect } from 'react';
import { Book, ArrowRight } from 'lucide-react';

const SYSTEM_DESIGN_TOPICS = {
  REQUIREMENTS: {
    title: 'Requirements Clarification',
    questions: [
      'What specific features are required?',
      'What scale are we designing for?',
      'What are the performance requirements?',
      'What are the security considerations?',
      'Are there any compliance requirements?'
    ],
    hints: [
      'Consider functional and non-functional requirements',
      'Quantify scale with specific metrics (QPS, DAU, etc.)',
      'Think about latency, throughput, and availability'
    ]
  },
  
  ARCHITECTURE: {
    title: 'System Architecture',
    questions: [
      'What are the core components needed?',
      'How will these components interact?',
      'What APIs will be required between components?',
      'Should we use a monolithic or microservice approach?'
    ],
    hints: [
      'Draw out the high-level architecture',
      'Consider separation of concerns',
      'Think about interfaces between systems'
    ]
  },
  
  STORAGE: {
    title: 'Data Storage',
    questions: [
      'What data needs to be stored?',
      'What is the schema design?',
      'Should we use SQL or NoSQL?',
      'What are the read/write patterns?',
      'Do we need caching?'
    ],
    hints: [
      'Consider the data access patterns',
      'Think about indexing strategies',
      'Consider eventual vs. strong consistency'
    ]
  },
  
  SCALABILITY: {
    title: 'Scaling Strategy',
    questions: [
      'What components need to scale?',
      'Should we scale horizontally or vertically?',
      'How will we handle database scaling?',
      'What are potential bottlenecks?'
    ],
    hints: [
      'Consider load balancing strategies',
      'Think about database sharding approaches',
      'Consider stateless vs. stateful services'
    ]
  },
  
  RELIABILITY: {
    title: 'Reliability & Fault Tolerance',
    questions: [
      'How will the system handle failures?',
      'What redundancy is needed?',
      'How will we monitor the system?',
      'What is our disaster recovery plan?'
    ],
    hints: [
      'Consider single points of failure',
      'Think about data replication strategies',
      'Consider circuit breaker patterns'
    ]
  }
};

const TopicGuidedCoaching = ({ currentTopic, onSendMessage, onGetMaterials }) => {
  const [activeTopic, setActiveTopic] = useState(null);
  
  useEffect(() => {
    // Set active topic based on current conversation or context
    if (currentTopic && SYSTEM_DESIGN_TOPICS[currentTopic]) {
      setActiveTopic(currentTopic);
    } else {
      // Default to requirements if no topic is active
      setActiveTopic('REQUIREMENTS');
    }
  }, [currentTopic]);
  
  if (!activeTopic) return null;
  
  const topic = SYSTEM_DESIGN_TOPICS[activeTopic];
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-900">{topic.title}</h3>
        <button 
          onClick={() => onGetMaterials(activeTopic.toLowerCase())}
          className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200 flex items-center"
        >
          <Book className="h-3 w-3 mr-1" />
          Learn more
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-600 font-medium">Key Questions:</p>
        <ul className="space-y-1">
          {topic.questions.map((question, index) => (
            <li key={index} className="flex items-start">
              <button
                onClick={() => onSendMessage(question)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                <ArrowRight className="h-3 w-3 inline mr-1 text-blue-500" />
                {question}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      {topic.hints.length > 0 && (
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <p className="text-xs text-yellow-800 font-medium mb-1">Hints:</p>
          <ul className="text-xs text-yellow-700 space-y-1">
            {topic.hints.map((hint, index) => (
              <li key={index}>• {hint}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-4 flex justify-between">
        {Object.keys(SYSTEM_DESIGN_TOPICS).map((topicKey) => (
          <button
            key={topicKey}
            onClick={() => setActiveTopic(topicKey)}
            className={`text-xs px-2 py-1 rounded ${
              activeTopic === topicKey
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {SYSTEM_DESIGN_TOPICS[topicKey].title.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopicGuidedCoaching;