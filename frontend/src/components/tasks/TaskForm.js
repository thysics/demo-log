import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    status: 'todo',
    project_id: ''
  });
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  // Fetch task data if in edit mode, and fetch projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch projects for dropdown
        const projectsResponse = await api.get('/api/projects');
        
        if (projectsResponse.data.success) {
          setProjects(projectsResponse.data.data);
        }
        
        // If in edit mode, fetch task data
        if (isEditMode) {
          const taskResponse = await api.get(`/api/tasks/${id}`);
          
          if (taskResponse.data.success) {
            const task = taskResponse.data.data;
            
            // Format due date for input if it exists
            let formattedDueDate = '';
            if (task.due_date) {
              const dueDate = new Date(task.due_date);
              formattedDueDate = dueDate.toISOString().split('T')[0];
            }
            
            setFormData({
              title: task.title,
              description: task.description || '',
              due_date: formattedDueDate,
              priority: task.priority,
              status: task.status,
              project_id: task.project_id || ''
            });
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
        console.error('Task form error:', err);
      }
    };
    
    fetchData();
  }, [id, isEditMode]);
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSubmitting(true);
      
      try {
        // Prepare data for API
        const taskData = {
          ...formData,
          project_id: formData.project_id || null
        };
        
        let response;
        
        if (isEditMode) {
          response = await api.put(`/api/tasks/${id}`, taskData);
        } else {
          response = await api.post('/api/tasks', taskData);
        }
        
        if (response.data.success) {
          navigate('/tasks');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to save task');
        console.error('Save task error:', err);
      } finally {
        setSubmitting(false);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="form-container">
      <h2 className="form-title">{isEditMode ? 'Edit Task' : 'Create Task'}</h2>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title *</label>
          <input
            type="text"
            className={`form-control ${formErrors.title ? 'is-invalid' : ''}`}
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
          />
          {formErrors.title && (
            <div className="invalid-feedback">{formErrors.title}</div>
          )}
        </div>
        
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Enter task description"
          ></textarea>
        </div>
        
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="due_date" className="form-label">Due Date</label>
            <input
              type="date"
              className="form-control"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
            />
          </div>
          
          <div className="col-md-6">
            <label htmlFor="project_id" className="form-label">Project</label>
            <select
              className="form-select"
              id="project_id"
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
            >
              <option value="">No Project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="priority" className="form-label">Priority</label>
            <select
              className="form-select"
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div className="col-md-6">
            <label htmlFor="status" className="form-label">Status</label>
            <select
              className="form-select"
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        
        <div className="d-flex justify-content-between">
          <Link to="/tasks" className="btn btn-outline-secondary">
            Cancel
          </Link>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditMode ? 'Update Task' : 'Create Task'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;