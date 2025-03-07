// client/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { loginUser, registerUser, getMe } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  
  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('auth_token');
      
      if (token) {
        try {
          const userData = await getMe();
          setUser(userData.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auth init error:', error);
          Cookies.remove('auth_token');
        }
      }
      
      setIsLoading(false);
    };
    
    initAuth();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      const data = await loginUser(email, password);
      
      // Store token in cookie
      Cookies.set('auth_token', data.token, { expires: 7 });
      
      setUser(data.user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };
  
  // Register function
  const register = async (name, email, password, experience) => {
    try {
      const data = await registerUser(name, email, password, experience);
      
      // Store token in cookie
      Cookies.set('auth_token', data.token, { expires: 7 });
      
      setUser(data.user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };
  
  // Logout function
  const logout = () => {
    Cookies.remove('auth_token');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/auth/login');
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;