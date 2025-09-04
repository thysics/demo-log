import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from .config import get_config
from .models.user import db
from .routes import auth_bp, tasks_bp, projects_bp

def create_app(config_name=None):
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(get_config())
    
    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    CORS(app)
    
    # Configure rate limiting
    limiter = Limiter(
        app,
        key_func=get_remote_address,
        default_limits=["100 per minute"],
        storage_uri=app.config['RATELIMIT_STORAGE_URL']
    )
    
    # Configure logging
    if not app.debug:
        handler = logging.StreamHandler()
        handler.setLevel(logging.INFO)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        app.logger.addHandler(handler)
        app.logger.setLevel(logging.INFO)
    else:
        # Even in debug mode, we want to see INFO logs
        app.logger.setLevel(logging.INFO)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(projects_bp)
    
    # Create database tables
    with app.app_context():
        try:
            db.create_all()
            app.logger.info("Database tables created successfully")
        except Exception as e:
            app.logger.error(f"Error creating database tables: {str(e)}")
            # This is critical, so we should re-raise the exception
            raise
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': 'Resource not found',
            'error': 404
        }), 404
    
    @app.errorhandler(500)
    def server_error(error):
        return jsonify({
            'success': False,
            'message': 'Internal server error',
            'error': 500
        }), 500
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'success': False,
            'message': 'Token has expired',
            'error': 'token_expired'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'success': False,
            'message': 'Invalid token',
            'error': 'invalid_token'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'success': False,
            'message': 'Authorization token is missing',
            'error': 'authorization_required'
        }), 401
    
    # Root route
    @app.route('/')
    def index():
        return jsonify({
            'success': True,
            'message': 'Task Management API',
            'version': '1.0.0'
        })
    
    return app