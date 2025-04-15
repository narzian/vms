import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  Link,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from '../../utils/axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Extract token and userId from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get('token');
    const userIdParam = queryParams.get('userId');
    
    if (!tokenParam || !userIdParam) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
      return;
    }
    
    setToken(tokenParam);
    setUserId(userIdParam);
  }, [location]);
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const validatePassword = (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number, one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await axios.post('users/reset-password', {
        userId,
        token,
        newPassword: password
      });
      
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          width: '100%', 
          maxWidth: 450,
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
          Reset Password
        </Typography>
        
        {success ? (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              Your password has been reset successfully!
            </Alert>
            <Typography variant="body1" sx={{ mb: 2 }}>
              You will be redirected to the login page in a few seconds...
            </Typography>
            <Button 
              component={RouterLink} 
              to="/login" 
              variant="outlined" 
              fullWidth
              sx={{ mt: 2 }}
            >
              Go to Login
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              Enter your new password below.
            </Typography>
            
            <TextField
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
            />
            
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
              Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.
            </Typography>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={isSubmitting || !token || !userId}
              sx={{ 
                mt: 2, 
                mb: 2,
                py: 1.5,
                bgcolor: '#6366F1',
                '&:hover': { bgcolor: '#4F46E5' }
              }}
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Back to Login
              </Link>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ResetPassword; 