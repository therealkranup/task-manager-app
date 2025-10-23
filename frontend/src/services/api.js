import axios from 'axios';

// Production backend URL - pointing to Render deployment
const PRODUCTION_API_URL = 'https://task-manager-app-tpdd.onrender.com/api';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || PRODUCTION_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export api for debugging
export { api };

// Allow setting token from outside
export const setAuthToken = (token) => {
  console.log('🔑 Setting auth token:', token ? 'Present' : 'Missing');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Authorization header set');
  } else {
    delete api.defaults.headers.common['Authorization'];
    console.log('❌ Authorization header removed');
  }
};

// Tasks API
export const tasksAPI = {
  // Get all tasks
  getAll: () => {
    console.log('📡 API: Getting all tasks');
    console.log('Headers:', api.defaults.headers);
    return api.get('/tasks');
  },
  
  // Get a specific task
  getById: (id) => {
    console.log('📡 API: Getting task', id);
    return api.get(`/tasks/${id}`);
  },
  
  // Create a new task
  create: (taskData) => {
    console.log('📡 API: Creating task', taskData);
    return api.post('/tasks', taskData);
  },
  
  // Update a task
  update: (id, taskData) => {
    console.log('📡 API: Updating task', id, taskData);
    return api.put(`/tasks/${id}`, taskData);
  },
  
  // Delete a task
  delete: (id) => {
    console.log('📡 API: Deleting task', id);
    return api.delete(`/tasks/${id}`);
  },
  
  // Toggle task completion
  toggleComplete: (id, completed) => {
    console.log('📡 API: Toggling task', id, 'to', completed);
    return api.put(`/tasks/${id}`, { completed });
  },
};

export default api;
