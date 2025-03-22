import React from 'react';
import dynamic from 'next/dynamic';

const SystemSequenceDiagram = dynamic(
  () => import('../components/diagram/SystemSequenceDiagram').then(mod => mod.SystemSequenceDiagram),
  { ssr: false }
);

const YourParentComponent = () => {
  // Add default values or fetch these from props/context
  const currentProblemId = "default";
  const currentUserId = "default";
  const sessionId = "default";
  const initialDiagramData = {};

  const handleSave = async (data) => {
    console.log('Saving diagram:', data);
  };

  return (
    <div>
      <SystemSequenceDiagram 
        problemId={currentProblemId} 
        userId={currentUserId}
        sessionId={sessionId}
        initialData={initialDiagramData}
        onSave={handleSave}
      />
    </div>
  );
};

// Add getStaticProps to handle SSG
export async function getStaticProps() {
  return {
    props: {}
  };
}

export default YourParentComponent;
