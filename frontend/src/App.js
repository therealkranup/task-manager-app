import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import { setAuthToken, tasksAPI } from './services/api';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import Auth from './components/Auth';
import './styles/index.css';

// Redeploy trigger - Vercel build settings configured

function App() {
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Manage auth session
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session || null);
      const token = data.session?.access_token || null;
      setAuthToken(token);
      setLoading(false);
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, _session) => {
      setSession(_session);
      setAuthToken(_session?.access_token || null);
      if (!_session) {
        setTasks([]);
      } else {
        fetchTasks();
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const fetchTasks = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const response = await tasksAPI.getAll();
      setTasks(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const response = await tasksAPI.create(taskData);
      setTasks(prev => [response.data, ...prev]);
      setError(null);
    } catch {
      setError('Failed to create task');
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      await tasksAPI.update(id, taskData);
      setTasks(prev => prev.map(task =>
        task.id === id ? { ...task, ...taskData, updated_at: new Date().toISOString() } : task
      ));
      setError(null);
    } catch {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await tasksAPI.delete(id);
      setTasks(prev => prev.filter(task => task.id !== id));
      setError(null);
    } catch {
      setError('Failed to delete task');
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      await tasksAPI.toggleComplete(id, completed);
      setTasks(prev => prev.map(task =>
        task.id === id ? { ...task, completed, updated_at: new Date().toISOString() } : task
      ));
      setError(null);
    } catch {
      setError('Failed to update task status');
    }
  };

  useEffect(() => {
    if (session) fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Task Manager</h1>
            <p className="text-gray-600">Please sign in to manage your tasks</p>
          </div>
          <Auth />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">Task Manager</h1>
            <p className="text-gray-600">Welcome back</p>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="mb-8">
          <TaskForm onSubmit={handleCreateTask} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">Loading tasks...</p>
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
            />
          )}
        </div>

        {!loading && tasks.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Total: {tasks.length} | Pending: {tasks.filter(t => !t.completed).length} | Completed: {tasks.filter(t => t.completed).length}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;