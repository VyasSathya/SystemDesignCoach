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
        tokenValue: token ? `${token.substring(0, 20)}...` : null,
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
          
          // Redirect to login if on protected route
          if (router.pathname !== '/auth/login' && router.pathname !== '/auth/register') {
            router.push('/auth/login');
          }
        }
      } else {
        console.log('No auth token found');
        setIsAuthenticated(false);
        setUser(null);
        
        // Redirect to login if on protected route
        if (router.pathname !== '/auth/login' && router.pathname !== '/auth/register') {
          router.push('/auth/login');
        }
      }
      
      setIsLoading(false);
    };
    
    initAuth();
  }, [router]);
  
  // Login function
  const login = async (email, password) => {
    try {
      console.log('Login attempt:', { email });
      const response = await loginUser(email, password);
      console.log('Login API Response:', {
        success: response.success,
        hasToken: !!response.token,
        hasUser: !!response.user
      });
      
      if (response.success && response.token) {
        // Store token in cookie
        Cookies.set('auth_token', response.token, {
          expires: 7,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        console.log('Cookie check after setting:', {
          hasAuthToken: !!Cookies.get('auth_token')
        });
        
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Redirect to dashboard or home
        router.push('/coaching');
        return { success: true };
      } else {
        console.error('Login failed - Invalid response:', response);
        return {
          success: false,
          error: response.error || 'Invalid login response'
        };
      }
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };
  
  // Register function
  const register = async (name, email, password, experience) => {
    try {
      const response = await registerUser(name, email, password, experience);
      
      if (response.success && response.token) {
        // Store token in cookie
        Cookies.set('auth_token', response.token, {
          expires: 7,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Redirect to dashboard or home
        router.push('/coaching');
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || 'Registration failed'
        };
      }
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
    Cookies.remove('auth_token', { path: '/' });
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