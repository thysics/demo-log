import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // Set the token in the API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Get user profile
        const response = await api.get('/api/auth/profile');
        
        if (response.data.success) {
          setCurrentUser(response.data.data);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        api.defaults.headers.common['Authorization'] = null;
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Register a new user
  const register = async (userData) => {
    setError(null);
    try {
      const response = await api.post('/api/auth/register', userData);
      
      if (response.data.success) {
        const { user, access_token, refresh_token } = response.data.data;
        
        // Store tokens
        localStorage.setItem('token', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        
        // Set auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        setCurrentUser(user);
        setIsAuthenticated(true);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  // Login user
  const login = async (credentials) => {
    setError(null);
    try {
      const response = await api.post('/api/auth/login', credentials);
      
      if (response.data.success) {
        const { user, access_token, refresh_token } = response.data.data;
        
        // Store tokens
        localStorage.setItem('token', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        
        // Set auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        setCurrentUser(user);
        setIsAuthenticated(true);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    api.defaults.headers.common['Authorization'] = null;
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setError(null);
    try {
      const response = await api.put('/api/auth/profile', userData);
      
      if (response.data.success) {
        setCurrentUser(response.data.data);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      return false;
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};