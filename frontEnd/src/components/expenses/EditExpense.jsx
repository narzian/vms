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
    CircularProgress,
    InputAdornment,
    Divider,
    Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from '../../utils/axios';

export default function EditExpense({ open, onClose, expense, onSave }) {
    const [formData, setFormData] = useState({
        expense_id: '',
        engagement_id: '',
        vendor_id: '',
        expense_category: '',
        expense_description: '',
        expense_amount: '',
        expense_currency: 'INR',
        expense_start_date: null,
        expense_end_date: null,
        expense_status: '',
        expense_notes: ''
    });
    
    const [engagements, setEngagements] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [duration, setDuration] = useState('');
    
    // Categories for expenses
    const expenseCategories = [
        'Consulting',
        'Software',
        'Hardware',
        'Travel',
        'Accommodation',
        'Meals',
        'Training',
        'Licensing',
        'Maintenance',
        'Support',
        'Other'
    ];
    
    // Status options
    const statusOptions = [
        'Pending',
        'Approved',
        'Rejected',
        'In Review'
    ];
    
    useEffect(() => {
        if (expense) {
            // Format dates properly
            const startDate = expense.expense_start_date ? new Date(expense.expense_start_date) : null;
            const endDate = expense.expense_end_date ? new Date(expense.expense_end_date) : null;
            
            setFormData({
                expense_id: expense.expense_id || '',
                engagement_id: expense.engagement_id || '',
                vendor_id: expense.vendor_id || '',
                expense_category: expense.expense_category || '',
                expense_description: expense.expense_description || '',
                expense_amount: expense.expense_amount || '',
                expense_currency: expense.expense_currency || 'INR',
                expense_start_date: startDate,
                expense_end_date: endDate,
                expense_status: expense.expense_status || '',
                expense_notes: expense.expense_notes || ''
            });
            
            // Calculate duration if both dates are available
            if (startDate && endDate) {
                calculateDuration(startDate, endDate);
            }
        }
    }, [expense]);
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch active engagements
                const engagementsResponse = await axios.get('engagements');
                setEngagements(engagementsResponse.data.filter(e => e.engagement_status !== 'Inactive'));
                
                // Fetch active vendors
                const vendorsResponse = await axios.get('vendors');
                setVendors(vendorsResponse.data.filter(v => v.vendor_status === 'Active'));
                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load required data. Please try again.');
                setLoading(false);
            }
        };
        
        if (open) {
            fetchData();
        }
    }, [open]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleDateChange = (name, date) => {
        setFormData(prev => ({
            ...prev,
            [name]: date
        }));
        
        // Update duration if both dates are set
        if (name === 'expense_start_date' && formData.expense_end_date) {
            calculateDuration(date, formData.expense_end_date);
        } else if (name === 'expense_end_date' && formData.expense_start_date) {
            calculateDuration(formData.expense_start_date, date);
        }
    };
    
    const calculateDuration = (startDate, endDate) => {
        if (!startDate || !endDate) return;
        
        // Ensure end date is not before start date
        if (endDate < startDate) {
            setError('End date cannot be before start date');
            return;
        }
        
        setError('');
        
        // Calculate difference in days
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            setDuration('1 day');
        } else if (diffDays === 1) {
            setDuration('1 day');
        } else {
            setDuration(`${diffDays} days`);
        }
    };
    
    const handleSubmit = async () => {
        // Validate form
        if (!formData.engagement_id || !formData.expense_category || !formData.expense_amount) {
            setError('Please fill in all required fields');
            return;
        }
        
        if (formData.expense_end_date && formData.expense_start_date && 
            new Date(formData.expense_end_date) < new Date(formData.expense_start_date)) {
            setError('End date cannot be before start date');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const result = await onSave(formData);
            setLoading(false);
            onClose();
        } catch (error) {
            setError('Failed to save expense: ' + (error.response?.data?.message || error.message));
            setLoading(false);
        }
    };
    
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            fullWidth
            maxWidth="md"
        >
            <DialogTitle>
                Edit Expense
            </DialogTitle>
            <DialogContent dividers>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="engagement-label">Engagement *</InputLabel>
                            <Select
                                labelId="engagement-label"
                                name="engagement_id"
                                value={formData.engagement_id}
                                onChange={handleChange}
                                label="Engagement *"
                                required
                            >
                                {engagements.map(engagement => (
                                    <MenuItem key={engagement.engagement_id} value={engagement.engagement_id}>
                                        {engagement.engagement_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="vendor-label">Vendor</InputLabel>
                            <Select
                                labelId="vendor-label"
                                name="vendor_id"
                                value={formData.vendor_id}
                                onChange={handleChange}
                                label="Vendor"
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
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="category-label">Expense Category *</InputLabel>
                            <Select
                                labelId="category-label"
                                name="expense_category"
                                value={formData.expense_category}
                                onChange={handleChange}
                                label="Expense Category *"
                                required
                            >
                                {expenseCategories.map(category => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            margin="normal"
                            name="expense_amount"
                            label="Amount *"
                            type="number"
                            value={formData.expense_amount}
                            onChange={handleChange}
                            required
                            InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            margin="normal"
                            name="expense_description"
                            label="Description"
                            value={formData.expense_description}
                            onChange={handleChange}
                            multiline
                            rows={2}
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" gutterBottom>
                            Date Information
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={5}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Start Date"
                                value={formData.expense_start_date}
                                onChange={(date) => handleDateChange('expense_start_date', date)}
                                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                                slotProps={{
                                    textField: { fullWidth: true, margin: "normal" }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    
                    <Grid item xs={12} md={5}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="End Date"
                                value={formData.expense_end_date}
                                onChange={(date) => handleDateChange('expense_end_date', date)}
                                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                                slotProps={{
                                    textField: { fullWidth: true, margin: "normal" }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    
                    <Grid item xs={12} md={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                                Duration: {duration || 'N/A'}
                            </Typography>
                        </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" gutterBottom>
                            Status Information
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="status-label">Status</InputLabel>
                            <Select
                                labelId="status-label"
                                name="expense_status"
                                value={formData.expense_status}
                                onChange={handleChange}
                                label="Status"
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
                        <TextField
                            fullWidth
                            margin="normal"
                            name="expense_notes"
                            label="Notes"
                            value={formData.expense_notes}
                            onChange={handleChange}
                            multiline
                            rows={3}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    color="primary" 
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
} 