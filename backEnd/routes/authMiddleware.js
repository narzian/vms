const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  let token = req.cookies.token || req.header('Authorization'); // Check cookies & headers

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // If token is in Bearer format, extract it
  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1]; // Remove "Bearer " prefix
  }

  try {
    // Verify token using secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    // Attach decoded user data to the request
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("Token validation failed:", err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
