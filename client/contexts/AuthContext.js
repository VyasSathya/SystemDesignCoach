import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Log when AuthProvider renders
  console.log('--- AuthProvider rendering ---');
  const [user, setUser] = useState(null);
  // Restore initial loading state
  const [loading, setLoading] = useState(true);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('>>> AuthProvider checkAuth effect running');
    const checkAuth = async () => {
      try {
        // Check local storage or cookies for token
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Validate token with backend
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        console.log('>>> AuthProvider checkAuth finished. Setting loading=false');
        setLoading(false);
      }
    };

    // Restore the actual auth check
    checkAuth();
    // console.log('>>> AuthProvider: checkAuth() call skipped for testing.');

    return () => {
      console.log('>>> AuthProvider checkAuth effect CLEANUP running');
    };
  }, []);

  // Add effect to log user/loading changes
  useEffect(() => {
    console.log('--- AuthProvider state changed: loading:', loading, 'user:', user?.id);
  }, [user, loading]);

  // Memoize the context value
  const value = useMemo(() => ({
    user,
    setUser,
    loading,
    setLoading,
    isAuthenticated: !!user
  }), [user, loading]); // Dependencies: user and loading

  // Log before returning children
  console.log('--- AuthProvider rendering children ---');

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  // Handle both null (initial value) and undefined (missing provider)
  if (context == null) { 
    console.error("useAuth hook: context is null or undefined.", context); // Add log
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
