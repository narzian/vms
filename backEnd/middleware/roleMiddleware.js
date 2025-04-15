const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const hasRole = allowedRoles.includes(req.user.role);
        if (!hasRole) {
            return res.status(403).json({ 
                message: 'Access denied. You do not have the required role.'
            });
        }

        next();
    };
};

// Define role hierarchy and permissions
const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    DEPARTMENT_HEAD: 'department_head',
    USER: 'user'
};

// Define role-based permissions
const PERMISSIONS = {
    [ROLES.ADMIN]: ['manage_users', 'manage_vendors', 'manage_departments', 'view_reports', 'approve_expenses'],
    [ROLES.MANAGER]: ['manage_vendors', 'view_reports', 'approve_expenses'],
    [ROLES.DEPARTMENT_HEAD]: ['manage_department_vendors', 'view_department_reports', 'approve_department_expenses'],
    [ROLES.USER]: ['view_assigned_vendors', 'submit_expenses']
};

// Middleware to check specific permissions
const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const userRole = req.user.role;
        const userPermissions = PERMISSIONS[userRole] || [];

        if (!userPermissions.includes(requiredPermission)) {
            return res.status(403).json({ 
                message: 'Access denied. You do not have the required permission.'
            });
        }

        next();
    };
};

module.exports = {
    checkRole,
    checkPermission,
    ROLES,
    PERMISSIONS
}; 