import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  Grid,
  Divider,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import axios from '../../utils/axios';

const UserProfile = () => {
  const { user, updateUserProfile, updateProfilePicture } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile form state
  const [formData, setFormData] = useState({
    user_name: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    department: ''
  });
  
  // Password change form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Profile picture state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  useEffect(() => {
    fetchUserProfile();
  }, []);
  
  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('users/profile');
      setProfileData(response.data);
      setFormData({
        user_name: response.data.user_name || '',
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        phone_number: response.data.phone_number || '',
        department: response.data.department || ''
      });
    } catch (err) {
      setError('Failed to load profile data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
    setSuccess('');
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const validatePassword = (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number, one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Use the updateUserProfile function from AuthContext
      const updatedUser = await updateUserProfile(formData);
      setProfileData(prev => ({
        ...prev,
        ...updatedUser
      }));
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setIsSubmitting(false);
      return;
    }
    
    if (!validatePassword(newPassword)) {
      setError('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character');
      setIsSubmitting(false);
      return;
    }
    
    try {
      await axios.put('users/change-password', {
        currentPassword,
        newPassword
      });
      setSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePictureSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    const formData = new FormData();
    formData.append('profilePicture', selectedFile);
    
    try {
      // Use the updateProfilePicture function from AuthContext
      const profilePicture = await updateProfilePicture(formData);
      setProfileData(prev => ({
        ...prev,
        profile_picture: profilePicture
      }));
      setSuccess('Profile picture updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setIsSubmitting(false);
      setSelectedFile(null);
    }
  };
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
      
      <Grid container spacing={3}>
        {/* Profile Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={profileData?.profile_picture || ''}
                sx={{ width: 120, height: 120, mb: 2 }}
              >
                {profileData?.user_name?.charAt(0) || <PersonIcon />}
              </Avatar>
              <Typography variant="h5">{profileData?.user_name || 'User'}</Typography>
              <Typography variant="body2" color="textSecondary">
                {profileData?.email}
              </Typography>
              <Typography variant="body2" color="primary" sx={{ mt: 1, textTransform: 'uppercase' }}>
                {profileData?.user_role}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Full Name
              </Typography>
              <Typography variant="body1" gutterBottom>
                {profileData?.first_name && profileData?.last_name 
                  ? `${profileData.first_name} ${profileData.last_name}`
                  : 'Not set'}
              </Typography>
              
              <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                Department
              </Typography>
              <Typography variant="body1" gutterBottom>
                {profileData?.department || 'Not set'}
              </Typography>
              
              <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                Phone Number
              </Typography>
              <Typography variant="body1" gutterBottom>
                {profileData?.phone_number || 'Not set'}
              </Typography>
              
              <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                Member Since
              </Typography>
              <Typography variant="body1" gutterBottom>
                {profileData?.created_at 
                  ? new Date(profileData.created_at).toLocaleDateString()
                  : 'Unknown'}
              </Typography>
              
              <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                Last Login
              </Typography>
              <Typography variant="body1">
                {profileData?.last_login 
                  ? new Date(profileData.last_login).toLocaleString()
                  : 'Unknown'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Profile Edit Tabs */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
              <Tab label="Edit Profile" icon={<EditIcon />} iconPosition="start" />
              <Tab label="Change Password" icon={<LockIcon />} iconPosition="start" />
              <Tab label="Profile Picture" icon={<PhotoCameraIcon />} iconPosition="start" />
            </Tabs>
            
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
            
            {/* Edit Profile Tab */}
            {activeTab === 0 && (
              <Box component="form" onSubmit={handleProfileSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="user_name"
                      label="Username"
                      fullWidth
                      value={formData.user_name}
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="first_name"
                      label="First Name"
                      fullWidth
                      value={formData.first_name}
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="last_name"
                      label="Last Name"
                      fullWidth
                      value={formData.last_name}
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="phone_number"
                      label="Phone Number"
                      fullWidth
                      value={formData.phone_number}
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="department"
                      label="Department"
                      fullWidth
                      value={formData.department}
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                      sx={{ 
                        mt: 2,
                        bgcolor: '#6366F1',
                        '&:hover': { bgcolor: '#4F46E5' }
                      }}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Change Password Tab */}
            {activeTab === 1 && (
              <Box component="form" onSubmit={handlePasswordSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="currentPassword"
                      label="Current Password"
                      type="password"
                      fullWidth
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="newPassword"
                      label="New Password"
                      type="password"
                      fullWidth
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="confirmPassword"
                      label="Confirm New Password"
                      type="password"
                      fullWidth
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">
                      Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                      sx={{ 
                        mt: 2,
                        bgcolor: '#6366F1',
                        '&:hover': { bgcolor: '#4F46E5' }
                      }}
                    >
                      {isSubmitting ? 'Changing...' : 'Change Password'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Profile Picture Tab */}
            {activeTab === 2 && (
              <Box component="form" onSubmit={handlePictureSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar
                      src={previewUrl || profileData?.profile_picture || ''}
                      sx={{ width: 150, height: 150 }}
                    >
                      {profileData?.user_name?.charAt(0) || <PersonIcon />}
                    </Avatar>
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<PhotoCameraIcon />}
                    >
                      Choose Photo
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </Button>
                  </Grid>
                  {selectedFile && (
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Typography variant="body2">
                        Selected: {selectedFile.name}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting || !selectedFile}
                      sx={{ 
                        mt: 2,
                        bgcolor: '#6366F1',
                        '&:hover': { bgcolor: '#4F46E5' }
                      }}
                    >
                      {isSubmitting ? 'Uploading...' : 'Upload Photo'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfile; 