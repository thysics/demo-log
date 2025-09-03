# Import routes to make them available when importing from routes package
from .auth import auth_bp
from .tasks import tasks_bp
from .projects import projects_bp