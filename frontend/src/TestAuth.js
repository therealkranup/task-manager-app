import React, { useState } from 'react';
import { supabase } from './services/supabase';
import { setAuthToken, api } from './services/api';

function TestAuth() {
  const [session, setSession] = useState(null);
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      // Try to get existing session first
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        setSession(sessionData.session);
        setAuthToken(sessionData.session.access_token);
        setTestResult('Using existing session! Token: ' + (sessionData.session.access_token ? 'Present' : 'Missing'));
        return;
      }
      
      // If no session, try to sign up a test user
      const { data, error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123'
      });
      
      if (error) {
        setTestResult('Signup error: ' + error.message + '. Try logging in with your real account first.');
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
      setTestResult('Login exception: ' + err.message);
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
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleLogin} style={{ marginRight: '10px', padding: '10px' }}>
          Test Login
        </button>
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
