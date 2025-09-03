import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    project_id: '',
    search: ''
  });
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse query parameters on initial load
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    
    const initialFilters = {
      status: queryParams.get('status') || '',
      priority: queryParams.get('priority') || '',
      project_id: queryParams.get('project_id') || '',
      search: queryParams.get('search') || ''
    };
    
    setFilters(initialFilters);
  }, [location.search]);
  
  // Fetch tasks and projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Build query string from filters
        const queryParams = new URLSearchParams();
        
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.priority) queryParams.append('priority', filters.priority);
        if (filters.project_id) queryParams.append('project_id', filters.project_id);
        if (filters.search) queryParams.append('search', filters.search);
        
        // Fetch tasks with filters
        const tasksResponse = await api.get(`/api/tasks?${queryParams.toString()}`);
        
        if (tasksResponse.data.success) {
          setTasks(tasksResponse.data.data);
        }
        
        // Fetch projects for filter dropdown
        const projectsResponse = await api.get('/api/projects');
        
        if (projectsResponse.data.success) {
          setProjects(projectsResponse.data.data);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load tasks');
        setLoading(false);
        console.error('Task list error:', err);
      }
    };
    
    fetchData();
  }, [filters]);
  
  // Update URL when filters change
  useEffect(() => {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.project_id) queryParams.append('project_id', filters.project_id);
    if (filters.search) queryParams.append('search', filters.search);
    
    navigate(`/tasks?${queryParams.toString()}`, { replace: true });
  }, [filters, navigate]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is already applied via the filters state
  };
  
  const handleClearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      project_id: '',
      search: ''
    });
  };
  
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await api.delete(`/api/tasks/${taskId}`);
        
        if (response.data.success) {
          // Remove task from state
          setTasks(tasks.filter(task => task.id !== taskId));
        }
      } catch (err) {
        console.error('Delete task error:', err);
        alert('Failed to delete task');
      }
    }
  };
  
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await api.put(`/api/tasks/${taskId}`, {
        status: newStatus
      });
      
      if (response.data.success) {
        // Update task in state
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        ));
      }
    } catch (err) {
      console.error('Update task status error:', err);
      alert('Failed to update task status');
    }
  };
  
  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading tasks...</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Tasks</h1>
        <Link to="/tasks/new" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          New Task
        </Link>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Filters</h5>
          
          <div className="task-filters">
            <div className="row g-3">
              <div className="col-md-3">
                <select
                  className="form-select"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Statuses</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div className="col-md-3">
                <select
                  className="form-select"
                  name="priority"
                  value={filters.priority}
                  onChange={handleFilterChange}
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div className="col-md-3">
                <select
                  className="form-select"
                  name="project_id"
                  value={filters.project_id}
                  onChange={handleFilterChange}
                >
                  <option value="">All Projects</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-3">
                <form onSubmit={handleSearchSubmit} className="d-flex">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search tasks..."
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                  <button type="submit" className="btn btn-outline-primary ms-2">
                    <i className="fas fa-search"></i>
                  </button>
                </form>
              </div>
            </div>
            
            <div className="mt-2">
              <button 
                className="btn btn-sm btn-outline-secondary" 
                onClick={handleClearFilters}
              >
                <i className="fas fa-times me-1"></i>
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="task-list">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <div 
              key={task.id} 
              className={`task-item priority-${task.priority} status-${task.status}`}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="task-title">{task.title}</h5>
                  <p className="mb-2">{task.description}</p>
                  <div className="task-meta">
                    <span>
                      <i className="fas fa-flag me-1"></i>
                      {task.priority}
                    </span>
                    <span>
                      <i className="fas fa-calendar me-1"></i>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                    </span>
                    {task.project_id && (
                      <span>
                        <i className="fas fa-folder me-1"></i>
                        {projects.find(p => p.id === task.project_id)?.name || 'Unknown project'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="task-actions">
                  <div className="dropdown">
                    <button 
                      className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                      type="button" 
                      id={`statusDropdown-${task.id}`} 
                      data-bs-toggle="dropdown"
                    >
                      {task.status === 'todo' ? 'To Do' : 
                       task.status === 'in-progress' ? 'In Progress' : 
                       'Completed'}
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <button 
                          className="dropdown-item" 
                          onClick={() => handleStatusChange(task.id, 'todo')}
                          disabled={task.status === 'todo'}
                        >
                          To Do
                        </button>
                      </li>
                      <li>
                        <button 
                          className="dropdown-item" 
                          onClick={() => handleStatusChange(task.id, 'in-progress')}
                          disabled={task.status === 'in-progress'}
                        >
                          In Progress
                        </button>
                      </li>
                      <li>
                        <button 
                          className="dropdown-item" 
                          onClick={() => handleStatusChange(task.id, 'completed')}
                          disabled={task.status === 'completed'}
                        >
                          Completed
                        </button>
                      </li>
                    </ul>
                  </div>
                  
                  <Link 
                    to={`/tasks/${task.id}`} 
                    className="btn btn-sm btn-outline-primary ms-1"
                  >
                    <i className="fas fa-edit"></i>
                  </Link>
                  
                  <button 
                    className="btn btn-sm btn-outline-danger ms-1"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-5">
            <i className="fas fa-tasks fa-3x text-muted mb-3"></i>
            <h5>No tasks found</h5>
            <p className="text-muted">
              {Object.values(filters).some(value => value) ? (
                <>
                  No tasks match your filters. 
                  <button 
                    className="btn btn-link p-0 ms-1"
                    onClick={handleClearFilters}
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  You don't have any tasks yet. 
                  <Link to="/tasks/new" className="btn btn-link p-0 ms-1">
                    Create your first task
                  </Link>
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;