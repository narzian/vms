import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import axios from '../../utils/axios';

const EditEngagement = ({ open, onClose, engagement, onSave }) => {
  const [formData, setFormData] = useState({});
  const [vendors, setVendors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(null);
  const [statusOptions] = useState(['Active', 'Inactive', 'Pending', 'Completed', 'On Hold']);

  useEffect(() => {
    if (engagement) {
      setFormData({
        engagement_id: engagement.engagement_id,
        engagement_name: engagement.engagement_name || '',
        engagement_type: engagement.engagement_type || '',
        engagement_status: engagement.engagement_status || '',
        start_date: engagement.start_date ? new Date(engagement.start_date).toISOString().split('T')[0] : '',
        end_date: engagement.end_date ? new Date(engagement.end_date).toISOString().split('T')[0] : '',
        engaged_vendor_id: engagement.engaged_vendor_id || '',
        engaged_department: engagement.engaged_department || '',
        contact_name: engagement.contact_name || '',
        contact_email: engagement.contact_email || '',
        contact_phone: engagement.contact_phone || ''
      });
    }
  }, [engagement]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get('vendors/active');
        setVendors(response.data || []);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await axios.get('departments');
        setDepartments(response.data || []);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchVendors();
    fetchDepartments();
  }, []);

  // Calculate duration between start and end dates
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      
      if (end >= start) {
        // Calculate the difference in milliseconds
        const diffTime = Math.abs(end - start);
        
        // Convert to days
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Calculate years, months, and remaining days
        let years = 0;
        let months = 0;
        let days = diffDays;
        
        // Calculate years
        if (days >= 365) {
          years = Math.floor(days / 365);
          days = days % 365;
        }
        
        // Calculate months (approximate)
        if (days >= 30) {
          months = Math.floor(days / 30);
          days = days % 30;
        }
        
        // Create duration string
        let durationText = '';
        if (years > 0) {
          durationText += `${years} year${years > 1 ? 's' : ''} `;
        }
        if (months > 0) {
          durationText += `${months} month${months > 1 ? 's' : ''} `;
        }
        if (days > 0 || (years === 0 && months === 0)) {
          durationText += `${days} day${days !== 1 ? 's' : ''}`;
        }
        
        setDuration(durationText.trim());
      } else {
        setDuration("End date must be after start date");
      }
    } else {
      setDuration(null);
    }
  }, [formData.start_date, formData.end_date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error updating engagement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!engagement) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #eee',
        pb: 2
      }}>
        <Typography variant="h6" component="div">
          Edit Engagement
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              Basic Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Engagement Name"
              name="engagement_name"
              value={formData.engagement_name}
              onChange={handleChange}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Engagement Type"
              name="engagement_type"
              value={formData.engagement_type}
              onChange={handleChange}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Vendor</InputLabel>
              <Select
                name="engaged_vendor_id"
                value={formData.engaged_vendor_id}
                label="Vendor"
                onChange={handleChange}
              >
                {vendors.map(vendor => (
                  <MenuItem key={vendor.vendor_id} value={vendor.vendor_id}>
                    {vendor.vendor_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                name="engaged_department"
                value={formData.engaged_department}
                label="Department"
                onChange={handleChange}
              >
                {departments.map(dept => (
                  <MenuItem key={dept.department_id} value={dept.department_name}>
                    {dept.department_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium" sx={{ mt: 2 }}>
              Timeline
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Start Date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="End Date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          {duration && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Duration: <Chip label={duration} size="small" color={duration.includes("must be") ? "error" : "primary"} />
                </Typography>
              </Box>
            </Grid>
          )}
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="engagement_status"
                value={formData.engagement_status}
                label="Status"
                onChange={handleChange}
              >
                {statusOptions.map(status => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium" sx={{ mt: 2 }}>
              Contact Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Contact Name"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Contact Email"
              name="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Contact Phone"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #eee' }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEngagement; 