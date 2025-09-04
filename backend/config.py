import os
from datetime import timedelta
import pathlib

# Get the absolute path to the project root directory
BASE_DIR = pathlib.Path(__file__).parent.parent.absolute()

class Config:
    # Flask configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev_key_for_development_only')
    DEBUG = False
    TESTING = False
    
    # Database configuration
    # Use absolute path for SQLite database to ensure consistent location
    DB_PATH = os.path.join(BASE_DIR, 'taskmanager.db')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', f'sqlite:///{DB_PATH}')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt_dev_key_for_development_only')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Rate limiting
    RATELIMIT_DEFAULT = "100 per minute"
    RATELIMIT_STORAGE_URL = "memory://"
    
    # CORS configuration
    CORS_HEADERS = 'Content-Type'

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True
    # Use absolute path for test database as well
    TEST_DB_PATH = os.path.join(BASE_DIR, 'test.db')
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{TEST_DB_PATH}'

class ProductionConfig(Config):
    # In production, these should be set as environment variables
    pass

config_by_name = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig
}

def get_config():
    env = os.environ.get('FLASK_ENV', 'development')
    return config_by_name[env]