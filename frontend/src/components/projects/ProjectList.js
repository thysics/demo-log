import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        const response = await api.get('/api/projects');
        
        if (response.data.success) {
          setProjects(response.data.data);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load projects');
        setLoading(false);
        console.error('Project list error:', err);
      }
    };
    
    fetchProjects();
  }, []);
  
  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? All associated tasks will be unlinked from this project.')) {
      try {
        const response = await api.delete(`/api/projects/${projectId}`);
        
        if (response.data.success) {
          // Remove project from state
          setProjects(projects.filter(project => project.id !== projectId));
        }
      } catch (err) {
        console.error('Delete project error:', err);
        alert('Failed to delete project');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading projects...</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Projects</h1>
        <Link to="/projects/new" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          New Project
        </Link>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <div className="project-list">
        {projects.length > 0 ? (
          projects.map(project => (
            <div key={project.id} className="project-item">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="mb-1">{project.name}</h5>
                  <p className="mb-2">{project.description}</p>
                  <div className="text-muted small">
                    <span>
                      <i className="fas fa-tasks me-1"></i>
                      {project.task_count} tasks
                    </span>
                    <span className="ms-3">
                      <i className="fas fa-calendar me-1"></i>
                      Created: {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div>
                  <Link 
                    to={`/tasks?project_id=${project.id}`} 
                    className="btn btn-sm btn-outline-secondary me-1"
                  >
                    <i className="fas fa-tasks me-1"></i>
                    View Tasks
                  </Link>
                  
                  <Link 
                    to={`/projects/${project.id}`} 
                    className="btn btn-sm btn-outline-primary me-1"
                  >
                    <i className="fas fa-edit"></i>
                  </Link>
                  
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-5">
            <i className="fas fa-folder-open fa-3x text-muted mb-3"></i>
            <h5>No projects found</h5>
            <p className="text-muted">
              You don't have any projects yet. 
              <Link to="/projects/new" className="btn btn-link p-0 ms-1">
                Create your first project
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;