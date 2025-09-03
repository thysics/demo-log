import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  // Fetch project data if in edit mode
  useEffect(() => {
    const fetchProject = async () => {
      if (!isEditMode) return;
      
      try {
        setLoading(true);
        
        const response = await api.get(`/api/projects/${id}`);
        
        if (response.data.success) {
          const project = response.data.data;
          
          setFormData({
            name: project.name,
            description: project.description || ''
          });
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load project');
        setLoading(false);
        console.error('Project form error:', err);
      }
    };
    
    fetchProject();
  }, [id, isEditMode]);
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
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
        let response;
        
        if (isEditMode) {
          response = await api.put(`/api/projects/${id}`, formData);
        } else {
          response = await api.post('/api/projects', formData);
        }
        
        if (response.data.success) {
          navigate('/projects');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to save project');
        console.error('Save project error:', err);
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
      <h2 className="form-title">{isEditMode ? 'Edit Project' : 'Create Project'}</h2>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name *</label>
          <input
            type="text"
            className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter project name"
          />
          {formErrors.name && (
            <div className="invalid-feedback">{formErrors.name}</div>
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
            placeholder="Enter project description"
          ></textarea>
        </div>
        
        <div className="d-flex justify-content-between">
          <Link to="/projects" className="btn btn-outline-secondary">
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
              isEditMode ? 'Update Project' : 'Create Project'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;