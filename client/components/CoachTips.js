import React from 'react';
import { Lightbulb } from 'lucide-react';

const CoachTips = ({ tips }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-medium">Coach Tips</h3>
      </div>
      <ul className="space-y-2">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="text-blue-500 font-medium">•</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CoachTips;