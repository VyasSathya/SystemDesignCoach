"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getCoachingSession } from '../utils/api';

export function useSession(sessionId) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    async function fetchSession() {
      try {
        setLoading(true);
        const data = await getCoachingSession(sessionId);
        setSession(data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching session ${sessionId}:`, err);
        setError("Failed to load session");
        if (err.response?.status === 401) {
          router.push('/auth/login');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [sessionId, router]);

  const updateSession = (newData) => {
    setSession(prev => ({
      ...prev,
      ...newData
    }));
  };

  return {
    session,
    loading,
    error,
    updateSession
  };
}