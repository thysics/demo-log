import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Dashboard = () => {
  const [taskStats, setTaskStats] = useState({
    todo: 0,
    in_progress: 0,
    completed: 0,
    total: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch task statistics
        const statsResponse = await api.get('/api/tasks/status-counts');
        
        if (statsResponse.data.success) {
          setTaskStats(statsResponse.data.data);
        }
        
        // Fetch recent tasks
        const tasksResponse = await api.get('/api/tasks?limit=5');
        
        if (tasksResponse.data.success) {
          setRecentTasks(tasksResponse.data.data);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
        console.error('Dashboard error:', err);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading dashboard...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-danger mt-4" role="alert">
        {error}
      </div>
    );
  }
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Dashboard</h1>
        <Link to="/tasks/new" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          New Task
        </Link>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card todo">
          <div className="stat-icon">
            <i className="fas fa-list fa-2x text-warning"></i>
          </div>
          <div className="stat-value">{taskStats.todo}</div>
          <div className="stat-label">To Do</div>
        </div>
        
        <div className="stat-card in-progress">
          <div className="stat-icon">
            <i className="fas fa-spinner fa-2x text-primary"></i>
          </div>
          <div className="stat-value">{taskStats.in_progress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        
        <div className="stat-card completed">
          <div className="stat-icon">
            <i className="fas fa-check-circle fa-2x text-success"></i>
          </div>
          <div className="stat-value">{taskStats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        
        <div className="stat-card total">
          <div className="stat-icon">
            <i className="fas fa-tasks fa-2x text-dark"></i>
          </div>
          <div className="stat-value">{taskStats.total}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Tasks</h5>
              <Link to="/tasks" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </div>
            <div className="card-body">
              {recentTasks.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {recentTasks.map(task => (
                    <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <span className={`badge bg-${task.status === 'completed' ? 'success' : task.status === 'in-progress' ? 'primary' : 'warning'} me-2`}>
                          {task.status}
                        </span>
                        <Link to={`/tasks/${task.id}`}>
                          {task.title}
                        </Link>
                      </div>
                      <span className="badge bg-secondary">
                        {task.priority}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted my-4">
                  No tasks found. <Link to="/tasks/new">Create a new task</Link>
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/tasks/new" className="btn btn-outline-primary">
                  <i className="fas fa-plus me-2"></i>
                  Create New Task
                </Link>
                <Link to="/projects/new" className="btn btn-outline-secondary">
                  <i className="fas fa-folder-plus me-2"></i>
                  Create New Project
                </Link>
                <Link to="/tasks?status=todo" className="btn btn-outline-warning">
                  <i className="fas fa-list me-2"></i>
                  View To-Do Tasks
                </Link>
                <Link to="/tasks?status=completed" className="btn btn-outline-success">
                  <i className="fas fa-check-circle me-2"></i>
                  View Completed Tasks
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;