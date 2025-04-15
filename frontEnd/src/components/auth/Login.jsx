import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  FormControlLabel, 
  Checkbox, 
  Paper, 
  Grid, 
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember_me: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'remember_me' ? checked : value
        }));
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.email, formData.password, formData.remember_me);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ 
            height: '100vh', 
            display: 'flex', 
            overflow: 'hidden'
        }}>
            {/* Left side - Image/Illustration */}
            <Box 
                sx={{ 
                    flex: 1, 
                    display: { xs: 'none', md: 'flex' },
                    position: 'relative',
                    bgcolor: '#6366F1',
                    color: 'white',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 4,
                    textAlign: 'center'
                }}
            >
                <Box sx={{ maxWidth: '80%' }}>
                    <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                        Vendor Management System
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                        Streamline your vendor operations, manage engagements, and track expenses efficiently
                    </Typography>
                    
                    {/* You can add an illustration or image here */}
                    <Box 
                        component="img" 
                        src="/assets/images/vendor-illustration.svg" 
                        alt="Vendor Management"
                        sx={{ 
                            maxWidth: '100%', 
                            height: 'auto',
                            mt: 4,
                            display: 'block',
                            mx: 'auto'
                        }}
                        onError={(e) => {
                            // Fallback if image doesn't exist
                            e.target.style.display = 'none';
                        }}
                    />
                </Box>
            </Box>
            
            {/* Right side - Login Form */}
            <Box 
                sx={{ 
                    flex: { xs: 1, md: 0.6 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    p: { xs: 2, sm: 4, md: 8 }
                }}
            >
                <Box sx={{ maxWidth: 400, mx: 'auto', width: '100%' }}>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                        Sign In
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Enter your credentials to access your account
                    </Typography>
                    
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}
                    
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={formData.email}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2 }}
                        />
                        
                        {/* Password field with single visibility toggle */}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleTogglePasswordVisibility}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            sx={{ mb: 2 }}
                        />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox 
                                        name="remember_me" 
                                        color="primary" 
                                        checked={formData.remember_me}
                                        onChange={handleChange}
                                    />
                                }
                                label="Remember me"
                            />
                            <Link 
                                to="/forgot-password" 
                                style={{ 
                                    textDecoration: 'none', 
                                    color: '#6366F1',
                                    fontWeight: 500
                                }}
                            >
                                Forgot password?
                            </Link>
                        </Box>
                        
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ 
                                mt: 2, 
                                mb: 2,
                                py: 1.5,
                                bgcolor: '#6366F1',
                                color: '#ffffff',
                                '&:hover': { bgcolor: '#4F46E5' }
                            }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Login; 