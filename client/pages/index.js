import React, { useState } from 'react';
import Dashboard from './dashboard';
import WorkbookLayout from './WorkbookLayout';

export default function Home() {
  const [view, setView] = useState('dashboard');
  
  if (view === 'workbook') {
    return <WorkbookLayout onBack={() => setView('dashboard')} />;
  }
  
  return <Dashboard onSelectWorkbook={() => setView('workbook')} />;
}