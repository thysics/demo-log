from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import db
from ..models.project import Project
from ..utils import validate_project_data, success_response, error_response

projects_bp = Blueprint('projects', __name__, url_prefix='/api/projects')

@projects_bp.route('', methods=['GET'])
@jwt_required()
def get_projects():
    current_user_id = get_jwt_identity()
    
    projects = Project.query.filter_by(user_id=current_user_id).all()
    projects_data = [project.to_dict() for project in projects]
    
    return success_response(projects_data, "Projects retrieved successfully")

@projects_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    current_user_id = get_jwt_identity()
    
    project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()
    
    if not project:
        return error_response("Project not found", status_code=404)
    
    return success_response(project.to_dict(), "Project retrieved successfully")

@projects_bp.route('', methods=['POST'])
@jwt_required()
def create_project():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate project data
    is_valid, errors = validate_project_data(data)
    if not is_valid:
        return error_response("Invalid project data", errors, status_code=400)
    
    # Create new project
    new_project = Project(
        name=data['name'],
        description=data.get('description', ''),
        user_id=current_user_id
    )
    
    try:
        db.session.add(new_project)
        db.session.commit()
        return success_response(new_project.to_dict(), "Project created successfully", status_code=201)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Error creating project: {str(e)}", status_code=500)

@projects_bp.route('/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    current_user_id = get_jwt_identity()
    
    project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()
    
    if not project:
        return error_response("Project not found", status_code=404)
    
    data = request.get_json()
    
    # Validate project data
    is_valid, errors = validate_project_data(data)
    if not is_valid:
        return error_response("Invalid project data", errors, status_code=400)
    
    # Update project fields if provided
    if 'name' in data:
        project.name = data['name']
    
    if 'description' in data:
        project.description = data['description']
    
    try:
        db.session.commit()
        return success_response(project.to_dict(), "Project updated successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Error updating project: {str(e)}", status_code=500)

@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    current_user_id = get_jwt_identity()
    
    project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()
    
    if not project:
        return error_response("Project not found", status_code=404)
    
    try:
        db.session.delete(project)
        db.session.commit()
        return success_response(message="Project deleted successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Error deleting project: {str(e)}", status_code=500)