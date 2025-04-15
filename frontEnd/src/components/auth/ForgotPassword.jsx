import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axios from '../../utils/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await axios.post('users/forgot-password', { email });
      setSuccess(true);
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
              If an account exists with this email, we've sent password reset instructions.
            </Alert>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Please check your email for further instructions.
            </Typography>
            <Button 
              component={RouterLink} 
              to="/login" 
              variant="outlined" 
              fullWidth
              sx={{ mt: 2 }}
            >
              Back to Login
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              Enter your email address and we'll send you instructions to reset your password.
            </Typography>
            
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              sx={{ mb: 3 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              sx={{ 
                mt: 2, 
                mb: 2,
                py: 1.5,
                bgcolor: '#6366F1',
                '&:hover': { bgcolor: '#4F46E5' }
              }}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword; 