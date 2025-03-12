// client/components/ConciseModeToggle.js
import React from 'react';
import { MessageSquare } from 'lucide-react';
import PersonaService from '../../server/services/engines/PersonaService';

const ConciseModeToggle = ({ isEnabled, onToggle }) => {
  const handleToggle = (enabled) => {
    // Update the concise mode flag in PersonaService
    PersonaService.setConciseMode(enabled);
    if (onToggle) onToggle(enabled);
  };

  return (
    <div className="flex items-center">
      <span className="mr-2 text-sm text-gray-600">Concise Mode</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isEnabled}
          onChange={(e) => handleToggle(e.target.checked)}
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 peer-focus:ring-4 peer-focus:ring-indigo-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
      </label>
      <MessageSquare size={16} className="ml-2 text-gray-600" />
    </div>
  );
};

export default ConciseModeToggle;
