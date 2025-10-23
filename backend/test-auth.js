const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true, // Allow all origins for testing
  credentials: true
}));
app.use(express.json());

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Simple health check
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint that shows all headers
app.get('/api/test-headers', (req, res) => {
  console.log('=== HEADERS TEST ===');
  console.log('All headers:', req.headers);
  console.log('Authorization:', req.headers.authorization);
  console.log('==================');
  
  res.json({
    message: 'Headers received',
    authorization: req.headers.authorization,
    allHeaders: req.headers
  });
});

// Test auth endpoint
app.post('/api/test-auth', async (req, res) => {
  try {
    const { token } = req.body;
    console.log('=== AUTH TEST ===');
    console.log('Token received:', token ? 'Present' : 'Missing');
    
    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }
    
    const { data, error } = await supabase.auth.getUser(token);
    console.log('Supabase result:', { data: data?.user?.id, error: error?.message });
    
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid token', details: error?.message });
    }
    
    res.json({ 
      success: true, 
      user: data.user.id,
      message: 'Auth successful' 
    });
  } catch (e) {
    console.log('Auth test error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Supabase URL: ${process.env.SUPABASE_URL ? 'Set' : 'Missing'}`);
  console.log(`🔑 Supabase Key: ${process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing'}`);
});
