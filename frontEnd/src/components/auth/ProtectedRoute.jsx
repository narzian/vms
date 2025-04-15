import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!token || !user) {
        // Not logged in, redirect to login page with return url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Role not authorized, redirect to home page
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute; 