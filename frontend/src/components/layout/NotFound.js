import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="text-center mt-5">
      <h1 className="display-1">404</h1>
      <p className="lead">Page Not Found</p>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary">
        <i className="fas fa-home me-2"></i>
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;