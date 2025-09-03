from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import or_
from ..models.user import db
from ..models.task import Task
from ..models.project import Project
from ..utils import validate_task_data, success_response, error_response

tasks_bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')

@tasks_bp.route('', methods=['GET'])
@jwt_required()
def get_tasks():
    current_user_id = get_jwt_identity()
    
    # Get query parameters for filtering
    status = request.args.get('status')
    priority = request.args.get('priority')
    project_id = request.args.get('project_id')
    due_date = request.args.get('due_date')
    search = request.args.get('search')
    
    # Start with base query for current user's tasks
    query = Task.query.filter_by(user_id=current_user_id)
    
    # Apply filters if provided
    if status:
        query = query.filter_by(status=status)
    
    if priority:
        query = query.filter_by(priority=priority)
    
    if project_id:
        query = query.filter_by(project_id=project_id)
    
    if due_date:
        try:
            due_date_obj = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
            query = query.filter(Task.due_date <= due_date_obj)
        except (ValueError, TypeError):
            return error_response("Invalid due date format", status_code=400)
    
    if search:
        query = query.filter(or_(
            Task.title.ilike(f'%{search}%'),
            Task.description.ilike(f'%{search}%')
        ))
    
    # Execute query and convert to list of dictionaries
    tasks = [task.to_dict() for task in query.all()]
    
    return success_response(tasks, "Tasks retrieved successfully")

@tasks_bp.route('/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    current_user_id = get_jwt_identity()
    
    task = Task.query.filter_by(id=task_id, user_id=current_user_id).first()
    
    if not task:
        return error_response("Task not found", status_code=404)
    
    return success_response(task.to_dict(), "Task retrieved successfully")

@tasks_bp.route('', methods=['POST'])
@jwt_required()
def create_task():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate task data
    is_valid, errors = validate_task_data(data)
    if not is_valid:
        return error_response("Invalid task data", errors, status_code=400)
    
    # Check if project exists and belongs to user if project_id is provided
    project_id = data.get('project_id')
    if project_id:
        project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()
        if not project:
            return error_response("Project not found or does not belong to user", status_code=404)
    
    # Parse due date if provided
    due_date = None
    if data.get('due_date'):
        try:
            due_date = datetime.fromisoformat(data.get('due_date').replace('Z', '+00:00'))
        except (ValueError, TypeError):
            return error_response("Invalid due date format", status_code=400)
    
    # Create new task
    new_task = Task(
        title=data['title'],
        description=data.get('description', ''),
        due_date=due_date,
        priority=data.get('priority', 'medium'),
        status=data.get('status', 'todo'),
        user_id=current_user_id,
        project_id=project_id
    )
    
    try:
        db.session.add(new_task)
        db.session.commit()
        return success_response(new_task.to_dict(), "Task created successfully", status_code=201)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Error creating task: {str(e)}", status_code=500)

@tasks_bp.route('/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    current_user_id = get_jwt_identity()
    
    task = Task.query.filter_by(id=task_id, user_id=current_user_id).first()
    
    if not task:
        return error_response("Task not found", status_code=404)
    
    data = request.get_json()
    
    # Validate task data
    is_valid, errors = validate_task_data(data)
    if not is_valid:
        return error_response("Invalid task data", errors, status_code=400)
    
    # Check if project exists and belongs to user if project_id is provided
    project_id = data.get('project_id')
    if project_id:
        project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()
        if not project:
            return error_response("Project not found or does not belong to user", status_code=404)
        task.project_id = project_id
    
    # Update task fields if provided
    if 'title' in data:
        task.title = data['title']
    
    if 'description' in data:
        task.description = data['description']
    
    if 'due_date' in data:
        if data['due_date']:
            try:
                task.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
            except (ValueError, TypeError):
                return error_response("Invalid due date format", status_code=400)
        else:
            task.due_date = None
    
    if 'priority' in data:
        task.priority = data['priority']
    
    if 'status' in data:
        task.status = data['status']
    
    try:
        db.session.commit()
        return success_response(task.to_dict(), "Task updated successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Error updating task: {str(e)}", status_code=500)

@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    current_user_id = get_jwt_identity()
    
    task = Task.query.filter_by(id=task_id, user_id=current_user_id).first()
    
    if not task:
        return error_response("Task not found", status_code=404)
    
    try:
        db.session.delete(task)
        db.session.commit()
        return success_response(message="Task deleted successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Error deleting task: {str(e)}", status_code=500)

@tasks_bp.route('/status-counts', methods=['GET'])
@jwt_required()
def get_status_counts():
    current_user_id = get_jwt_identity()
    
    # Count tasks by status
    todo_count = Task.query.filter_by(user_id=current_user_id, status='todo').count()
    in_progress_count = Task.query.filter_by(user_id=current_user_id, status='in-progress').count()
    completed_count = Task.query.filter_by(user_id=current_user_id, status='completed').count()
    
    return success_response({
        'todo': todo_count,
        'in_progress': in_progress_count,
        'completed': completed_count,
        'total': todo_count + in_progress_count + completed_count
    }, "Task status counts retrieved successfully")