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
const dbPath = path.join(__dirname, 'tasks.db');
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
  res.json({ status: 'OK', message: 'Task Manager API is running' });
});

// All routes below this line require auth
app.use('/api/tasks', requireAuth);

// GET /api/tasks - Get all tasks for the authenticated user
app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET /api/tasks/:id - Get a specific task (owned by user)
app.get('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json(row);
  });
});

// POST /api/tasks - Create a new task for the user
app.post('/api/tasks', (req, res) => {
  const { title, description } = req.body;
  
  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  db.run(
    'INSERT INTO tasks (title, description, completed, user_id) VALUES (?, ?, 0, ?)',
    [title, description || '', req.user.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ 
        id: this.lastID, 
        title, 
        description: description || '', 
        completed: false,
        user_id: req.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  );
});

// PUT /api/tasks/:id - Update a task (only if owned by user)
app.put('/api/tasks/:id', (req, res) => {
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

  db.run(query, values, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ message: 'Task updated successfully' });
  });
});

// DELETE /api/tasks/:id - Delete a task (only if owned by user)
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ message: 'Task deleted successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
