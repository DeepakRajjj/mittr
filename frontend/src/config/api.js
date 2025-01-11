import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://mittr-backend.onrender.com/api';

console.log('API Base URL:', BASE_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: false, // Changed to false for CORS
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ensure CORS headers are present
    config.headers['Access-Control-Allow-Origin'] = 'https://mittr.netlify.app';
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response from:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const endpoints = {
  users: {
    getAll: () => api.get('/users'),
  },
  friends: {
    getAll: () => api.get('/friends'),
    remove: (userId) => api.post(`/friends/remove/${userId}`),
    requests: {
      send: (userId) => api.post(`/friends/request/${userId}`),
      getReceived: () => api.get('/friends/requests/received'),
      getSent: () => api.get('/friends/requests/sent'),
      accept: (userId) => api.post(`/friends/accept/${userId}`),
      decline: (userId) => api.post(`/friends/decline/${userId}`),
    },
  },
};

export default api;