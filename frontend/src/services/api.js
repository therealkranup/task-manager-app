import axios from 'axios';

// Production backend URL - update this with your Railway deployment URL
const PRODUCTION_API_URL = 'https://your-backend-name.railway.app/api';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  (process.env.NODE_ENV === 'production' ? PRODUCTION_API_URL : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Allow setting token from outside
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Tasks API
export const tasksAPI = {
  // Get all tasks
  getAll: () => api.get('/tasks'),
  
  // Get a specific task
  getById: (id) => api.get(`/tasks/${id}`),
  
  // Create a new task
  create: (taskData) => api.post('/tasks', taskData),
  
  // Update a task
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  
  // Delete a task
  delete: (id) => api.delete(`/tasks/${id}`),
  
  // Toggle task completion
  toggleComplete: (id, completed) => api.put(`/tasks/${id}`, { completed }),
};

export default api;
