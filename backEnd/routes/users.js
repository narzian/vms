const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const db = require('../db');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../uploads/profile-pictures');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `profile-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Debug route - remove in production
router.get('/debug/users', async (req, res) => {
  try {
    const result = await db.query('SELECT user_id, email, user_name, user_role, created_at, last_login FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Debug route to reset admin password - REMOVE IN PRODUCTION
router.post('/debug/reset-admin', async (req, res) => {
  try {
    const newPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, 'admin@example.com']);
    res.json({ message: 'Admin password reset successfully to: Admin@123' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug route for password hash - remove in production
router.post('/debug/hash-password', async (req, res) => {
  try {
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const isMatch = await bcrypt.compare(password, hashedPassword);
    res.json({
      originalPassword: password,
      hashedPassword: hashedPassword,
      passwordMatch: isMatch
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware to check if any users exist
const checkFirstUser = async (req, res, next) => {
  try {
    const result = await db.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(result.rows[0].count);
    console.log('Current user count:', userCount); // Debug log
    
    if (userCount === 0) {
      // If no users exist, allow creation without auth
      console.log('No users exist, allowing creation'); // Debug log
      return next();
    } else {
      console.log('Users exist, checking auth'); // Debug log
      // If users exist, check for auth token
      const token = req.header('Authorization');
      if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
      }
      
      return requireAuth(req, res, next);
    }
  } catch (error) {
    console.error('Error checking user count:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
router.get('/me', requireAuth, userController.getCurrentUser);

// Authentication routes
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.post('/logout', requireAuth, userController.logoutUser);

// Password reset routes
router.post('/forgot-password', userController.generateResetToken);
router.post('/reset-password', userController.resetPassword);

// User profile routes
router.get('/profile', requireAuth, userController.getUserProfile);
router.put('/profile', requireAuth, userController.updateUserProfile);
router.put('/change-password', requireAuth, userController.changePassword);
router.post('/profile-picture', requireAuth, upload.single('profilePicture'), userController.uploadProfilePicture);

module.exports = router;
