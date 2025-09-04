from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from ..models.user import User, db
from ..utils import validate_email, validate_password, success_response, error_response

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ['name', 'email', 'password']):
        return error_response("Missing required fields", status_code=400)
    
    # Validate email
    is_valid_email, email_or_error = validate_email(data['email'])
    if not is_valid_email:
        return error_response("Invalid email", {"email": email_or_error}, status_code=400)
    
    # Validate password
    is_valid_password, password_or_error = validate_password(data['password'])
    if not is_valid_password:
        return error_response("Invalid password", {"password": password_or_error}, status_code=400)
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        current_app.logger.warning(f"Registration attempt with existing email: {data['email']}")
        return error_response("User already exists", status_code=409)
    
    try:
        current_app.logger.info(f"Attempting to register new user with email: {data['email']}")
        
        # Create new user
        new_user = User(
            name=data['name'],
            email=data['email'],
            password=data['password']
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        current_app.logger.info(f"User registered successfully: {new_user.id}")
        
        # Generate tokens
        access_token = create_access_token(identity=new_user.id)
        refresh_token = create_refresh_token(identity=new_user.id)
        
        return success_response({
            'user': new_user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }, "User registered successfully", status_code=201)
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating user: {str(e)}")
        return error_response(f"Error creating user: {str(e)}", status_code=500)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ['email', 'password']):
        return error_response("Missing email or password", status_code=400)
    
    # Find user by email
    user = User.query.filter_by(email=data['email']).first()
    if not user or not User.verify_hash(data['password'], user.password_hash):
        return error_response("Invalid email or password", status_code=401)
    
    # Generate tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return success_response({
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }, "Login successful")

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    access_token = create_access_token(identity=current_user_id)
    
    return success_response({
        'access_token': access_token
    }, "Token refreshed successfully")

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return error_response("User not found", status_code=404)
    
    return success_response(user.to_dict(), "Profile retrieved successfully")

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return error_response("User not found", status_code=404)
    
    data = request.get_json()
    
    # Update name if provided
    if 'name' in data:
        user.name = data['name']
    
    # Update email if provided
    if 'email' in data:
        is_valid_email, email_or_error = validate_email(data['email'])
        if not is_valid_email:
            return error_response("Invalid email", {"email": email_or_error}, status_code=400)
        
        # Check if email is already taken by another user
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user and existing_user.id != current_user_id:
            return error_response("Email already in use", status_code=409)
        
        user.email = data['email']
    
    # Update password if provided
    if 'password' in data:
        is_valid_password, password_or_error = validate_password(data['password'])
        if not is_valid_password:
            return error_response("Invalid password", {"password": password_or_error}, status_code=400)
        
        user.password_hash = User.generate_hash(data['password'])
    
    try:
        db.session.commit()
        return success_response(user.to_dict(), "Profile updated successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Error updating profile: {str(e)}", status_code=500)