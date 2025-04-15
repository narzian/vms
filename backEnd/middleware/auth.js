const jwt = require('jsonwebtoken');
const db = require('../db');

// Middleware to verify JWT token and add user info to request
const requireAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookies
    let token = req.cookies.token || req.header('Authorization');

    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // If token is in Bearer format, extract it
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Get user from database to ensure they still exist and have proper permissions
    const result = await db.query(
      'SELECT user_id, email, first_name, last_name, user_role FROM users WHERE user_id = $1',
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'User not found or no longer active.' });
    }
    
    const user = result.rows[0];
    
    // Add user info to request object
    req.user = {
      id: user.user_id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      role: user.user_role
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    
    res.status(500).json({ message: 'Server error in authentication.' });
  }
};

// Optional middleware to get user if token exists, but proceed anyway if not
const getUser = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookies
    let token = req.cookies.token || req.header('Authorization');

    // If no token, just continue without setting user
    if (!token) {
      return next();
    }

    // If token is in Bearer format, extract it
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Get user from database
    const result = await db.query(
      'SELECT user_id, email, first_name, last_name, user_role FROM users WHERE user_id = $1',
      [decoded.id]
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      req.user = {
        id: user.user_id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.user_role
      };
    }
    
    next();
  } catch (error) {
    // Just continue without setting user on error
    next();
  }
};

module.exports = {
  requireAuth,
  getUser
}; 