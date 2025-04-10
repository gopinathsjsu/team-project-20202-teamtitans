import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have tokens in localStorage
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!accessToken || !refreshToken) {
          setLoading(false);
          return;
        }

        // Set default Authorization header for all requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // Fetch user data
        const response = await axios.get('/api/users/me/');
        
        if (response.data) {
          setUser(response.data);
        }
      } catch (err) {
        // If token is expired, try to refresh
        if (err.response && err.response.status === 401) {
          try {
            await refreshAccessToken();
          } catch (refreshErr) {
            // If refresh fails, log out
            logout();
          }
        }
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post('/api/users/login/', { email, password });
      const { user, tokens } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);
      
      // Set axios default headers for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
      
      // Set user in state
      setUser(user);
      
      return user;
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.detail || 'Login failed. Please check your credentials.');
      } else {
        setError('Network error. Please try again later.');
      }
      throw err;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post('/api/users/register/', userData);
      
      // If registration automatically logs in user
      if (response.data.tokens) {
        const { user, tokens } = response.data;
        
        // Store tokens in localStorage
        localStorage.setItem('accessToken', tokens.access);
        localStorage.setItem('refreshToken', tokens.refresh);
        
        // Set axios default headers for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
        
        // Set user in state
        setUser(user);
      }
      
      return response.data;
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.detail || 'Registration failed. Please try again.');
      } else {
        setError('Network error. Please try again later.');
      }
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    // Remove tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Clear axios default headers
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear user from state
    setUser(null);
  };

  // Refresh token function
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axios.post('/api/users/token/refresh/', {
        refresh: refreshToken
      });
      
      const { access } = response.data;
      
      // Update localStorage
      localStorage.setItem('accessToken', access);
      
      // Update axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      return access;
    } catch (err) {
      console.error('Token refresh error:', err);
      throw err;
    }
  };

  // Axios response interceptor to handle token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        // If error is 401 (Unauthorized) and the request hasn't been retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh the token
            const newToken = await refreshAccessToken();
            
            // Retry the original request with the new token
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // If refresh fails, log the user out
            logout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    // Clean up interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Create context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshAccessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;