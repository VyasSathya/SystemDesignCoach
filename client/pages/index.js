import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Dashboard from './dashboard';

// Dynamically import WorkbookLayout with no SSR to avoid hydration issues
const WorkbookLayout = dynamic(() => import('./WorkbookLayout'), {
  ssr: false
});

export default function Home() {
  const [view, setView] = useState('dashboard');
  
  if (view === 'workbook') {
    return <WorkbookLayout onBack={() => setView('dashboard')} />;
  }
  
  return <Dashboard onSelectWorkbook={() => setView('workbook')} />;
}