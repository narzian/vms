const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  // Configure your email service here
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const userController = {
  // Get Current User
  async getCurrentUser(req, res) {
    try {
      const userResult = await db.query(
        'SELECT user_id, email, user_name, user_role FROM users WHERE user_id = $1',
        [req.user.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(userResult.rows[0]);
    } catch (error) {
      console.error('Error fetching current user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Create User
  async createUser(req, res) {
    const { email, password, user_name, user_role } = req.body;

    try {
      // Check if user already exists
      const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const result = await db.query(
        'INSERT INTO users (email, password, user_name, user_role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING user_id, email, user_name, user_role',
        [email, hashedPassword, user_name, user_role]
      );

      res.status(201).json({
        message: 'User created successfully',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // List Users
  async listUsers(req, res) {
    try {
      const result = await db.query(
        'SELECT user_id, email, user_name, user_role, created_at, last_login FROM users ORDER BY created_at DESC'
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error listing users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Login with remember me functionality
  async loginUser(req, res) {
    const { email, password, remember_me } = req.body;
    console.log('Login attempt:', { email, password: '***', remember_me });

    try {
      // Check user exists
      const userResult = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      console.log('User found:', userResult.rows.length > 0);

      if (userResult.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = userResult.rows[0];
      console.log('Stored password hash:', user.password);

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('Password valid:', isValidPassword);

      if (!isValidPassword) {
        // Update login attempts
        await db.query(
          'UPDATE users SET login_attempts = login_attempts + 1, last_login_attempt = NOW() WHERE user_id = $1',
          [user.user_id]
        );

        if (user.login_attempts >= 4) {
          await db.query(
            'UPDATE users SET account_locked = true, locked_until = NOW() + INTERVAL \'15 minutes\' WHERE user_id = $1',
            [user.user_id]
          );
          return res.status(401).json({ message: 'Account locked. Try again in 15 minutes.' });
        }

        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Reset login attempts on successful login
      await db.query(
        'UPDATE users SET login_attempts = 0, last_login = NOW() WHERE user_id = $1',
        [user.user_id]
      );

      // Create session
      const sessionToken = crypto.randomBytes(32).toString('hex');
      await db.query(
        'INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)',
        [user.user_id, sessionToken, remember_me ? new Date(Date.now() + 30*24*60*60*1000) : new Date(Date.now() + 24*60*60*1000)]
      );

      // Generate JWT
    const token = jwt.sign(
        { id: user.user_id, role: user.user_role },
      process.env.JWT_SECRET,
        { expiresIn: remember_me ? '30d' : '24h' }
    );

      // Set cookie
      res.cookie('token', token, {
      httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: remember_me ? 30*24*60*60*1000 : 24*60*60*1000
      });

      res.json({
        user_id: user.user_id,
        email: user.email,
        user_role: user.user_role,
        token: token
      });
  } catch (error) {
      console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  },

  // Forgot Password
  async forgotPassword(req, res) {
    const { email } = req.body;

    try {
      const userResult = await db.query(
        'SELECT user_id FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      await db.query(
        'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
        [resetToken, resetTokenExpiry, email]
      );

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

      await transporter.sendMail({
        to: email,
        subject: 'Password Reset Request',
        html: `
          <p>You requested a password reset</p>
          <p>Click this <a href="${resetUrl}">link</a> to reset your password</p>
          <p>This link will expire in 1 hour</p>
        `
      });

      res.json({ message: 'Password reset email sent' });
  } catch (error) {
      console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  },

  // Reset Password
  async resetPassword(req, res) {
    const { token } = req.params;
    const { password } = req.body;

    try {
      const userResult = await db.query(
        'SELECT user_id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
        [token]
      );

      if (userResult.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

    const hashedPassword = await bcrypt.hash(password, 10);

      await db.query(
        'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE user_id = $2',
        [hashedPassword, userResult.rows[0].user_id]
      );

      res.json({ message: 'Password reset successful' });
  } catch (error) {
      console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  },

  // Change Password (for logged-in users)
  async changePassword(req, res) {
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      // Get user
      const userQuery = "SELECT * FROM users WHERE user_id = $1";
      const userResult = await db.query(userQuery, [userId]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const user = userResult.rows[0];
      
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      const updateQuery = "UPDATE users SET password = $1, updated_at = NOW() WHERE user_id = $2";
      await db.query(updateQuery, [hashedPassword, userId]);
      
      res.status(200).json({ message: "Password changed successfully" });
      
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Logout
  async logoutUser(req, res) {
    try {
      const sessionToken = req.cookies.session;
      if (sessionToken) {
        await db.query(
          'DELETE FROM user_sessions WHERE session_token = $1',
          [sessionToken]
        );
      }

      res.clearCookie('token');
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get User Sessions
  async getUserSessions(req, res) {
    try {
      const sessions = await db.query(
        'SELECT session_id, created_at, expires_at FROM user_sessions WHERE user_id = $1',
        [req.user.id]
      );

      res.json(sessions.rows);
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Terminate Session
  async terminateSession(req, res) {
    const { sessionId } = req.params;

    try {
      await db.query(
        'DELETE FROM user_sessions WHERE session_id = $1 AND user_id = $2',
        [sessionId, req.user.id]
      );

      res.json({ message: 'Session terminated successfully' });
  } catch (error) {
      console.error('Terminate session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  },

  // Get User Profile
  async getUserProfile(req, res) {
    try {
      const userResult = await db.query(
        'SELECT user_id, email, user_name, user_role, created_at, last_login FROM users WHERE user_id = $1',
        [req.user.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(userResult.rows[0]);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update user profile
  async updateUserProfile(req, res) {
    try {
      const userId = req.user.userId;
      const { user_name, first_name, last_name, phone_number, department } = req.body;
      
      // Check if user exists
      const checkUserQuery = "SELECT * FROM users WHERE user_id = $1";
      const userResult = await db.query(checkUserQuery, [userId]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user profile
      const updateQuery = `
        UPDATE users 
        SET 
          user_name = COALESCE($1, user_name),
          first_name = COALESCE($2, first_name),
          last_name = COALESCE($3, last_name),
          phone_number = COALESCE($4, phone_number),
          department = COALESCE($5, department),
          updated_at = NOW()
        WHERE user_id = $6
        RETURNING user_id, email, user_name, user_role, first_name, last_name, phone_number, department
      `;
      
      const updateValues = [
        user_name || null,
        first_name || null,
        last_name || null,
        phone_number || null,
        department || null,
        userId
      ];
      
      const updateResult = await db.query(updateQuery, updateValues);
      
      res.status(200).json({
        message: "Profile updated successfully",
        user: updateResult.rows[0]
      });
      
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Generate password reset token
  async generateResetToken(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Check if user exists
      const userQuery = "SELECT * FROM users WHERE email = $1";
      const userResult = await db.query(userQuery, [email]);
      
      if (userResult.rows.length === 0) {
        // For security reasons, don't reveal that the email doesn't exist
        return res.status(200).json({ message: "If your email exists in our system, you will receive a password reset link" });
      }
      
      const user = userResult.rows[0];
      
      // Generate a random token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = await bcrypt.hash(resetToken, 10);
      
      // Set token expiration (1 hour from now)
      const resetTokenExpiry = new Date();
      resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);
      
      // Save token to database
      const updateQuery = `
        UPDATE users 
        SET reset_token = $1, reset_token_expiry = $2 
        WHERE user_id = $3
      `;
      await db.query(updateQuery, [resetTokenHash, resetTokenExpiry, user.user_id]);
      
      // In a real application, you would send an email with the reset link
      // For now, we'll just return the token in the response
      console.log(`Reset token for ${email}: ${resetToken}`);
      
      res.status(200).json({ 
        message: "If your email exists in our system, you will receive a password reset link",
        // In production, remove the token from the response and send it via email only
        token: resetToken, 
        userId: user.user_id
      });
      
    } catch (error) {
      console.error("Error generating reset token:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Verify reset token and reset password
  async resetPassword(req, res) {
    try {
      const { userId, token, newPassword } = req.body;
      
      if (!userId || !token || !newPassword) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Get user with the reset token
      const userQuery = "SELECT * FROM users WHERE user_id = $1";
      const userResult = await db.query(userQuery, [userId]);
      
      if (userResult.rows.length === 0) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      const user = userResult.rows[0];
      
      // Check if token is expired
      if (!user.reset_token_expiry || new Date() > new Date(user.reset_token_expiry)) {
        return res.status(400).json({ message: "Reset token has expired" });
      }
      
      // Verify token
      const isValidToken = await bcrypt.compare(token, user.reset_token);
      if (!isValidToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password and clear reset token
      const updateQuery = `
        UPDATE users 
        SET password = $1, reset_token = NULL, reset_token_expiry = NULL 
        WHERE user_id = $2
      `;
      await db.query(updateQuery, [hashedPassword, userId]);
      
      res.status(200).json({ message: "Password has been reset successfully" });
      
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Upload profile picture
  async uploadProfilePicture(req, res) {
    try {
      const userId = req.user.userId;
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Get file path
      const profilePicturePath = req.file.path;
      
      // Update user profile with picture path
      const updateQuery = "UPDATE users SET profile_picture = $1, updated_at = NOW() WHERE user_id = $2";
      await db.query(updateQuery, [profilePicturePath, userId]);
      
      res.status(200).json({ 
        message: "Profile picture uploaded successfully",
        profilePicture: profilePicturePath
      });
      
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = userController;
