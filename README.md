# Task Management App

A clean, responsive web application for managing tasks with user authentication, project organization, and filtering capabilities.

## Features

### User Management
- User registration and login with email/password
- Profile management (name, email)
- Secure authentication with JWT

### Task Operations
- Create, read, update, delete tasks
- Task fields: title, description, due date, priority (high/medium/low), status (todo/in-progress/completed)
- Mark tasks as complete/incomplete
- Delete completed tasks

### Organization Features
- Create and manage project/category lists
- Assign tasks to projects
- Filter tasks by: status, priority, project, due date
- Search tasks by title/description

### User Interface
- Clean, responsive web interface
- Task list view with sorting options
- Simple task creation/editing forms
- Dashboard showing task counts by status

## Tech Stack

### Backend
- Flask (Python web framework)
- SQLAlchemy ORM with SQLite database
- Flask-JWT-Extended for authentication
- Input validation and error handling
- Rate limiting on API endpoints

### Frontend
- React single-page application
- React Router for navigation
- Axios for API requests
- Bootstrap for responsive design
- FontAwesome icons

## Project Structure

```
/
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Middleware functions
│   │   ├── config/          # Configuration files
│   │   ├── utils/           # Utility functions
│   │   ├── db/              # Database setup and migrations
│   │   └── index.js         # Entry point
│   ├── .env                 # Environment variables
│   └── package.json         # Backend dependencies
│
└── frontend/                # React frontend
    ├── public/              # Static files
    ├── src/
    │   ├── components/      # React components
    │   ├── pages/           # Page components
    │   ├── services/        # API services
    │   ├── utils/           # Utility functions
    │   ├── context/         # React context
    │   ├── App.js           # Main App component
    │   └── index.js         # Entry point
    └── package.json         # Frontend dependencies
```

## Installation

### Prerequisites
- Python 3.7+
- Node.js 14+
- npm or yarn

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/task-management-app.git
cd task-management-app
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Run the Flask application:
```bash
python run.py
```

The backend API will be available at http://localhost:5000.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install JavaScript dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

The frontend application will be available at http://localhost:3000.

## Quick Start

1. Register a new account at http://localhost:3000/register
2. Log in with your credentials
3. Create projects to organize your tasks
4. Add tasks and assign them to projects
5. Use the dashboard to monitor your progress
6. Filter and search tasks as needed

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT tokens
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Tasks
- `GET /api/tasks` - Get all tasks (with optional filters)
- `GET /api/tasks/<id>` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/<id>` - Update a task
- `DELETE /api/tasks/<id>` - Delete a task
- `GET /api/tasks/status-counts` - Get task counts by status

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/<id>` - Get a specific project
- `POST /api/projects` - Create a new project
- `PUT /api/projects/<id>` - Update a project
- `DELETE /api/projects/<id>` - Delete a project

## Security Features

- Password hashing with PBKDF2
- JWT-based authentication
- User data isolation
- Input validation and sanitization
- Rate limiting to prevent abuse

## License

MIT