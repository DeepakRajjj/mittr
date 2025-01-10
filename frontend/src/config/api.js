import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
