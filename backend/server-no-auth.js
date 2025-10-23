const express = require('express');
const cors = require('cors');

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

// In-memory storage for demo (data resets on restart)
let tasks = [];
let nextId = 1;

// Public routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Task Manager API is running (No Auth Version)',
    environment: process.env.NODE_ENV || 'development',
    database: 'in-memory',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Task Manager Backend API (No Auth)',
    health: '/api/health',
    docs: '/api/tasks'
  });
});

// GET /api/tasks - Get all tasks (no auth required)
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// GET /api/tasks/:id - Get a specific task
app.get('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const task = tasks.find(t => t.id === parseInt(id));
  
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json(task);
});

// POST /api/tasks - Create a new task
app.post('/api/tasks', (req, res) => {
  const { title, description } = req.body;
  
  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const task = {
    id: nextId++,
    title,
    description: description || '',
    completed: false,
    user_id: 'demo-user', // Fixed user for demo
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  tasks.push(task);
  res.status(201).json(task);
});

// PUT /api/tasks/:id - Update a task
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  
  const taskIndex = tasks.findIndex(t => t.id === parseInt(id));
  
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
  const taskIndex = tasks.findIndex(t => t.id === parseInt(id));
  
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
  console.log(`Database: in-memory (no auth)`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});
