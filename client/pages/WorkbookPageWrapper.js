import React from 'react';
import { Box, Container, Paper } from '@mui/material';
import { MessageSquare, Save } from 'lucide-react';

const WorkbookPageWrapper = ({ children, onSaveAndContinue, isValid, nextSection }) => {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
      <div className="sticky bottom-0 w-full bg-white border-t border-gray-200 p-4 flex justify-between items-center shadow-md">
        <button className="flex items-center px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors">
          <MessageSquare size={16} className="mr-2" />
          Ask Coach
        </button>
        <button 
          onClick={onSaveAndContinue}
          disabled={!isValid}
          className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors shadow-sm ${
            isValid 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Save size={16} className="mr-2" />
          Save & Continue
        </button>
      </div>
    </div>
  );
};

export default WorkbookPageWrapper;