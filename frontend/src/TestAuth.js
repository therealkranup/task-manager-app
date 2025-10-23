import React, { useState } from 'react';
import { supabase } from './services/supabase';
import { setAuthToken, api } from './services/api';

function TestAuth() {
  const [session, setSession] = useState(null);
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setTestResult('Please enter email and password');
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) {
        setTestResult('Login error: ' + error.message);
        return;
      }
      
      setSession(data.session);
      setAuthToken(data.session.access_token);
      setTestResult('Login successful! Token: ' + (data.session.access_token ? 'Present' : 'Missing'));
    } catch (err) {
      setTestResult('Login exception: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password) {
      setTestResult('Please enter email and password');
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
      });
      
      if (error) {
        setTestResult('Signup error: ' + error.message);
        return;
      }
      
      if (data.session) {
        setSession(data.session);
        setAuthToken(data.session.access_token);
        setTestResult('Signup successful! Token: ' + (data.session.access_token ? 'Present' : 'Missing'));
      } else {
        setTestResult('Signup successful but no session. Check your email for confirmation.');
      }
    } catch (err) {
      setTestResult('Signup exception: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const testHeaders = async () => {
    try {
      setLoading(true);
      // First test if backend is reachable
      const healthResponse = await api.get('/health');
      setTestResult('Backend health: ' + JSON.stringify(healthResponse.data, null, 2) + '\n\n');
      
      // Then test headers
      const response = await api.get('/test-headers');
      setTestResult(prev => prev + 'Headers test: ' + JSON.stringify(response.data, null, 2));
    } catch (err) {
      setTestResult('Headers test error: ' + err.message + '\n\nBackend URL: ' + api.defaults.baseURL);
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    if (!session) {
      setTestResult('No session - please login first');
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.post('/test-auth', { 
        token: session.access_token 
      });
      setTestResult('Auth test: ' + JSON.stringify(response.data, null, 2));
    } catch (err) {
      setTestResult('Auth test error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Auth Debug Test</h1>
      
      {/* Login Form */}
      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Login/Signup</h3>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>
        <div>
          <button 
            onClick={handleLogin} 
            disabled={loading}
            style={{ marginRight: '10px', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <button 
            onClick={handleSignup} 
            disabled={loading}
            style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            {loading ? 'Signing up...' : 'Signup'}
          </button>
        </div>
      </div>
      
      {/* Test Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testHeaders} style={{ marginRight: '10px', padding: '10px' }}>
          Test Headers
        </button>
        <button onClick={testAuth} style={{ padding: '10px' }}>
          Test Auth
        </button>
      </div>
      
      <div>
        <h3>Session:</h3>
        <pre>{JSON.stringify(session, null, 2)}</pre>
        
        <h3>API Headers:</h3>
        <pre>{JSON.stringify(api.defaults.headers.common, null, 2)}</pre>
        
        <h3>Test Result:</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {loading ? 'Loading...' : testResult}
        </pre>
      </div>
    </div>
  );
}

export default TestAuth;
