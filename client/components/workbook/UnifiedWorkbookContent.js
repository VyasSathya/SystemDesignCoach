'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '../../contexts/AuthContext';

const Flow = dynamic(
  () => import('../SimpleFlow'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }
);

export default function UnifiedWorkbookContent() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <p>Please log in to access the workbook</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px]">
      {typeof window !== 'undefined' && <Flow />}
    </div>
  );
}

