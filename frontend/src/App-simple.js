import React, { useState, useEffect } from 'react';
import { tasksAPI } from './services/api';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import './styles/index.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">Task Manager</h1>
            <p className="text-gray-600">Simple task management (Demo Version)</p>
          </div>
          <div className="text-sm text-gray-500">
            <p>No authentication required</p>
            <p>Data resets on server restart</p>
          </div>
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

        {!loading && tasks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No tasks yet</p>
            <p className="text-sm">Create your first task above!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
