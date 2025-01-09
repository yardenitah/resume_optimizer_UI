import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    // If no token, redirect to login
    return <Navigate to="/login" replace />;
  }
  // Otherwise, render the protected page
  return children;
}

export default PrivateRoute;
 