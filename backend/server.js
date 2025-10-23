const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Railway deployment
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://task-manager-app-blush-nine.vercel.app', 'https://task-manager-app-git-main-therealkranups-projects.vercel.app']
    : true,
  credentials: true
}));
app.use(express.json());

// Supabase client (server-side, using anon key is fine for verifying user token)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Database setup
// Use in-memory database for Render deployment (data will reset on restart)
// For production, consider using Supabase PostgreSQL instead
const dbPath = process.env.NODE_ENV === 'production' 
  ? ':memory:' 
  : path.join(__dirname, 'tasks.db');
const db = new sqlite3.Database(dbPath);

// Create tasks table if it doesn't exist, and ensure user_id column exists
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT 0,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Try to add user_id if table existed without it (ignore error if already there)
  db.run(`ALTER TABLE tasks ADD COLUMN user_id TEXT`, () => {});
});

// Auth middleware: requires Bearer token, resolves Supabase user
async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing Authorization header' });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid or expired token' });

    req.user = { id: data.user.id };
    next();
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// Public route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Task Manager API is running',
    environment: process.env.NODE_ENV || 'development',
    database: dbPath,
    timestamp: new Date().toISOString()
  });
});

// Root route for Render health checks
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
  try {
    const stmt = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC');
    const rows = stmt.all(req.user.id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/:id - Get a specific task (owned by user)
app.get('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?');
    const row = stmt.get(id, req.user.id);
    
    if (!row) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks - Create a new task for the user
app.post('/api/tasks', (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const stmt = db.prepare('INSERT INTO tasks (title, description, completed, user_id) VALUES (?, ?, 0, ?)');
    const result = stmt.run(title, description || '', req.user.id);
    
    res.status(201).json({ 
      id: result.lastInsertRowid, 
      title, 
      description: description || '', 
      completed: false,
      user_id: req.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tasks/:id - Update a task (only if owned by user)
app.put('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    const updateFields = [];
    const values = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      values.push(description);
    }
    if (completed !== undefined) {
      updateFields.push('completed = ?');
      values.push(completed ? 1 : 0);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    const query = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`;
    values.push(id, req.user.id);

    const stmt = db.prepare(query);
    const result = stmt.run(...values);
    
    if (result.changes === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ message: 'Task updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id - Delete a task (only if owned by user)
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?');
    const result = stmt.run(id, req.user.id);
    
    if (result.changes === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  try {
    db.close();
    console.log('Database connection closed.');
  } catch (err) {
    console.error('Error closing database:', err.message);
  }
  process.exit(0);
});
