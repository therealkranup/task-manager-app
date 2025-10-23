const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for deployment
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://task-manager-app-blush-nine.vercel.app', 'https://task-manager-app-git-main-therealkranups-projects.vercel.app']
    : true,
  credentials: true
}));
app.use(express.json());

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// In-memory storage for demo (data resets on restart)
let tasks = [];
let nextId = 1;

// Auth middleware
async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    
    console.log('=== AUTH DEBUG ===');
    console.log('Auth header:', auth);
    console.log('Token present:', !!token);
    console.log('Token length:', token ? token.length : 0);
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    console.log('🔍 Validating token with Supabase...');
    const { data, error } = await supabase.auth.getUser(token);
    
    console.log('Supabase response:', {
      hasData: !!data,
      hasUser: !!data?.user,
      userId: data?.user?.id,
      error: error?.message
    });
    
    if (error) {
      console.log('❌ Supabase error:', error.message);
      return res.status(401).json({ error: 'Invalid or expired token', details: error.message });
    }
    
    if (!data?.user) {
      console.log('❌ No user data from Supabase');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = { id: data.user.id };
    console.log('✅ Auth successful for user:', data.user.id);
    console.log('==================');
    next();
  } catch (e) {
    console.log('❌ Auth exception:', e.message);
    res.status(401).json({ error: 'Unauthorized', details: e.message });
  }
}

// Public routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Task Manager API is running',
    environment: process.env.NODE_ENV || 'development',
    database: 'in-memory',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Task Manager Backend API',
    health: '/api/health',
    docs: '/api/tasks'
  });
});

// All routes below this line require auth
app.use('/api/tasks', requireAuth);

// GET /api/tasks - Get all tasks for the authenticated user
app.get('/api/tasks', (req, res) => {
  console.log('📋 GET /api/tasks - User:', req.user.id);
  const userTasks = tasks.filter(task => task.user_id === req.user.id);
  console.log('📋 Found tasks:', userTasks.length);
  res.json(userTasks);
});

// GET /api/tasks/:id - Get a specific task
app.get('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const task = tasks.find(t => t.id === parseInt(id) && t.user_id === req.user.id);
  
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json(task);
});

// POST /api/tasks - Create a new task
app.post('/api/tasks', (req, res) => {
  console.log('➕ POST /api/tasks - User:', req.user.id, 'Data:', req.body);
  const { title, description } = req.body;
  
  if (!title) {
    console.log('❌ No title provided');
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const task = {
    id: nextId++,
    title,
    description: description || '',
    completed: false,
    user_id: req.user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  tasks.push(task);
  console.log('✅ Task created:', task);
  res.status(201).json(task);
});

// PUT /api/tasks/:id - Update a task
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  
  const taskIndex = tasks.findIndex(t => t.id === parseInt(id) && t.user_id === req.user.id);
  
  if (taskIndex === -1) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const task = tasks[taskIndex];
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (completed !== undefined) task.completed = completed;
  task.updated_at = new Date().toISOString();

  res.json({ message: 'Task updated successfully' });
});

// DELETE /api/tasks/:id - Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(t => t.id === parseInt(id) && t.user_id === req.user.id);
  
  if (taskIndex === -1) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  tasks.splice(taskIndex, 1);
  res.json({ message: 'Task deleted successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: in-memory`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});
