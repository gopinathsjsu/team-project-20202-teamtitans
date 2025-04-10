import axios from 'axios';

// Set base URL for API calls
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Categories of API calls
export const api = {
  // Authentication endpoints
  auth: {
    login: (credentials) => axios.post('/api/users/login/', credentials),
    register: (userData) => axios.post('/api/users/register/', userData),
    refreshToken: (refreshToken) => axios.post('/api/users/token/refresh/', { refresh: refreshToken }),
    getCurrentUser: () => axios.get('/api/users/me/'),
    updateProfile: (userData) => axios.put('/api/users/me/', userData),
  }
};

export default api;