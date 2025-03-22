import React, { useState } from 'react';
import WorkbookPageWrapper from './WorkbookPageWrapper';
import dynamic from 'next/dynamic';

// Dynamically import SystemSequenceDiagram with SSR disabled
const SystemSequenceDiagram = dynamic(
  () => import('../components/diagram/SystemSequenceDiagram'),
  { ssr: false } // This is crucial - it prevents SSR for this component
);

import { useSession } from '../hooks/useSession';

const DiagramsPage = () => {
  const [currentDiagram, setCurrentDiagram] = useState(null);
  const { sessionId } = useSession();

  const handleSaveAndContinue = async () => {
    // Implement your save logic here
    console.log('Saving diagram and continuing...');
  };

  const isValid = true; // Implement your validation logic

  return (
    <WorkbookPageWrapper
      onSaveAndContinue={handleSaveAndContinue}
      isValid={isValid}
      nextSection="Implementation"
    >
      <div className="flex flex-col min-h-full bg-white">
        <div className="p-6 space-y-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">System Design Diagrams</h2>
          </div>
          
          <div className="h-[calc(100vh-200px)]"> {/* Adjust height to account for header and footer */}
            <SystemSequenceDiagram
              sessionId={sessionId}
              onChange={setCurrentDiagram}
            />
          </div>
        </div>
      </div>
    </WorkbookPageWrapper>
  );
};

export default DiagramsPage;

