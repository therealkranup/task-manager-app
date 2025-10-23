import React, { useState } from 'react';
import { supabase } from '../services/supabase';

const Auth = () => {
  const [mode, setMode] = useState('sign_in'); // 'sign_in' | 'sign_up'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (mode === 'sign_in') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for a confirmation link (if email confirmation is enabled).');
      }
    } catch (e) {
      setErr(e.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">
        {mode === 'sign_in' ? 'Log in' : 'Sign up'}
      </h2>
      {err && <div className="mb-3 text-red-600 text-sm">{err}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Please wait...' : (mode === 'sign_in' ? 'Log in' : 'Create account')}
        </button>
      </form>
      <div className="mt-4 text-sm text-center">
        {mode === 'sign_in' ? (
          <button className="text-primary-600 hover:text-primary-700" onClick={()=>setMode('sign_up')}>
            Need an account? Sign up
          </button>
        ) : (
          <button className="text-primary-600 hover:text-primary-700" onClick={()=>setMode('sign_in')}>
            Have an account? Log in
          </button>
        )}
      </div>
    </div>
  );
};

export default Auth;
