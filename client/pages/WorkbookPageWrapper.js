import React from 'react';
import { Box, Container, Paper } from '@mui/material';
import { MessageSquare, Save } from 'lucide-react';

const WorkbookPageWrapper = ({ children, onSaveAndContinue, isValid, nextSection }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default WorkbookPageWrapper;
