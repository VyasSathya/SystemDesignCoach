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
      console.log('Auth Check:', {
        hasToken: !!token,
        tokenValue: token?.substring(0, 20) + '...',  // Log first 20 chars of token
        currentPath: router.pathname
      });
      
      if (token) {
        try {
          const userData = await getMe();
          console.log('Auth Success:', {
            user: userData.user,
            authenticated: true
          });
          setUser(userData.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auth Error:', {
            error: error.message,
            status: error.response?.status,
            data: error.response?.data
          });
          Cookies.remove('auth_token');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        console.log('No auth token found');
        setIsAuthenticated(false);
        setUser(null);
      }
      
      setIsLoading(false);
    };
    
    initAuth();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      console.log('Login attempt:', { email });
      const response = await loginUser(email, password);
      console.log('API Response:', response);
      
      if (response.success && response.token) {
        // Store token in cookie with explicit domain and path
        Cookies.set('auth_token', response.token, {
          expires: 7,
          path: '/',
          domain: 'localhost',
          secure: false, // Set to true in production
          sameSite: 'lax'
        });
        
        console.log('Token stored in cookie:', response.token.substring(0, 20) + '...');
        console.log('Cookie verification:', {
          stored: Cookies.get('auth_token') ? 'yes' : 'no',
          value: Cookies.get('auth_token')?.substring(0, 20) + '...'
        });
        
        setUser(response.user);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        console.error('Login failed:', response);
        return {
          success: false,
          error: response.error || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error details:', error);
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