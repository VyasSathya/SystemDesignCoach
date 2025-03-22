'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Import the component with SSR disabled
const UnifiedWorkbookContent = dynamic(
  () => import('../components/workbook/UnifiedWorkbookContent').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }
);

export default function UnifiedWorkbookPage() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Workbook</h1>
      <UnifiedWorkbookContent />
    </div>
  );
}



