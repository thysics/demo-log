import re
from datetime import datetime
from email_validator import validate_email as validate_email_lib, EmailNotValidError

def validate_email(email):
    """Validate email format"""
    # Special cases for localhost and IP addresses
    if '@' in email:
        local_part, domain = email.rsplit('@', 1)
        if local_part and (domain == 'localhost' or (domain.replace('.', '').isdigit() and domain.count('.') == 3)):
            return True, email
    
    try:
        valid = validate_email_lib(email, check_deliverability=False)
        return True, valid.email
    except EmailNotValidError as e:
        return False, str(e)

def validate_password(password):
    """
    Validate password strength
    - At least 8 characters
    - Contains at least one digit
    - Contains at least one uppercase letter
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r"\d", password):
        return False, "Password must contain at least one digit"
    
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    
    return True, password

def validate_task_data(data):
    """Validate task data"""
    errors = {}
    
    # Title is required
    if not data.get('title'):
        errors['title'] = "Title is required"
    elif len(data.get('title', '')) > 100:
        errors['title'] = "Title must be less than 100 characters"
    
    # Priority must be one of: high, medium, low
    if data.get('priority') and data.get('priority') not in ['high', 'medium', 'low']:
        errors['priority'] = "Priority must be one of: high, medium, low"
    
    # Status must be one of: todo, in-progress, completed
    if data.get('status') and data.get('status') not in ['todo', 'in-progress', 'completed']:
        errors['status'] = "Status must be one of: todo, in-progress, completed"
    
    # Due date must be a valid date
    if data.get('due_date'):
        try:
            datetime.fromisoformat(data.get('due_date').replace('Z', '+00:00'))
        except (ValueError, TypeError):
            errors['due_date'] = "Due date must be a valid ISO format date"
    
    return len(errors) == 0, errors

def validate_project_data(data):
    """Validate project data"""
    errors = {}
    
    # Name is required
    if not data.get('name'):
        errors['name'] = "Name is required"
    elif len(data.get('name', '')) > 100:
        errors['name'] = "Name must be less than 100 characters"
    
    return len(errors) == 0, errors