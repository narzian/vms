import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Button,
    TextField,
    InputAdornment,
    TableSortLabel,
    TablePagination,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Card,
    CardContent,
    Grid,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Alert,
    Snackbar
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    Search as SearchIcon, 
    Description as DescriptionIcon,
    FilterList as FilterIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import EditEngagement from './EditEngagement';

export default function EngagementList() {
    const navigate = useNavigate();
    const [engagements, setEngagements] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredEngagements, setFilteredEngagements] = useState([]);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('engagement_name');
    
    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // Filter states
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        engagement_type: [],
        engagement_status: [],
        engaged_department: []
    });
    
    // Filter options
    const [filterOptions, setFilterOptions] = useState({
        engagement_type: [],
        engagement_status: [],
        engaged_department: []
    });
    
    // Edit modal
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentEngagement, setCurrentEngagement] = useState(null);
    
    // Delete dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [engagementToDelete, setEngagementToDelete] = useState(null);
    
    // Snackbar
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        const fetchEngagements = async () => {
            try {
                const response = await axios.get('engagements');
                setEngagements(response.data);
                setFilteredEngagements(response.data);
                
                // Extract filter options
                const types = [...new Set(response.data.map(e => e.engagement_type))].filter(Boolean);
                const statuses = [...new Set(response.data.map(e => e.engagement_status))].filter(Boolean);
                const departments = [...new Set(response.data.map(e => e.engaged_department))].filter(Boolean);
                
                setFilterOptions({
                    engagement_type: types,
                    engagement_status: statuses,
                    engaged_department: departments
                });
            } catch (error) {
                console.error('Error fetching engagements:', error);
                setSnackbar({
                    open: true,
                    message: 'Failed to fetch engagements: ' + (error.response?.data?.message || error.message),
                    severity: 'error'
                });
            }
        };
        fetchEngagements();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [engagements, searchTerm, filters]);

    const applyFilters = () => {
        let filtered = engagements;
        
        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(engagement =>
                engagement.engagement_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (engagement.vendor_name && engagement.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        
        // Apply category filters
        Object.keys(filters).forEach(filterKey => {
            if (filters[filterKey].length > 0) {
                filtered = filtered.filter(engagement => 
                    filters[filterKey].includes(engagement[filterKey])
                );
            }
        });
        
        setFilteredEngagements(filtered);
        setPage(0); // Reset to first page when filters change
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'success';
            case 'In Progress':
                return 'primary';
            case 'On Hold':
                return 'warning';
            case 'Inactive':
                return 'error';
            default:
                return 'default';
        }
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortedEngagements = React.useMemo(() => {
        const stabilizedThis = filteredEngagements.map((el, index) => [el, index]);
        stabilizedThis.sort((a, b) => {
            let aValue = a[0][orderBy];
            let bValue = b[0][orderBy];
            
            // Handle date comparisons
            if (orderBy === 'start_date' || orderBy === 'end_date') {
                aValue = aValue ? new Date(aValue).getTime() : 0;
                bValue = bValue ? new Date(bValue).getTime() : 0;
            } else {
                aValue = aValue || '';
                bValue = bValue || '';
            }
            
            if (order === 'desc') {
                if (bValue < aValue) return -1;
                if (bValue > aValue) return 1;
                return a[1] - b[1];
            } else {
                if (aValue < bValue) return -1;
                if (aValue > bValue) return 1;
                return a[1] - b[1];
            }
        });
        return stabilizedThis.map((el) => el[0]);
    }, [filteredEngagements, order, orderBy]);

    const createSortHandler = (property) => () => {
        handleRequestSort(property);
    };
    
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    
    const handleFilterToggle = () => {
        setFilterOpen(!filterOpen);
    };
    
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => {
            const currentFilters = [...prev[filterType]];
            const valueIndex = currentFilters.indexOf(value);
            
            if (valueIndex === -1) {
                currentFilters.push(value);
            } else {
                currentFilters.splice(valueIndex, 1);
            }
            
            return {
                ...prev,
                [filterType]: currentFilters
            };
        });
    };
    
    const clearFilters = () => {
        setFilters({
            engagement_type: [],
            engagement_status: [],
            engaged_department: []
        });
        setSearchTerm('');
    };
    
    const handleEditClick = (engagement) => {
        setCurrentEngagement(engagement);
        setEditModalOpen(true);
    };
    
    const handleEditClose = () => {
        setEditModalOpen(false);
        setCurrentEngagement(null);
    };
    
    const handleSaveEngagement = async (updatedEngagement) => {
        try {
            const response = await axios.put(`engagements/${updatedEngagement.engagement_id}`, updatedEngagement);
            
            // Update state
            setEngagements(prev => prev.map(e => 
                e.engagement_id === updatedEngagement.engagement_id ? response.data : e
            ));
            
            setSnackbar({
                open: true,
                message: 'Engagement updated successfully',
                severity: 'success'
            });
            
            return response.data;
        } catch (error) {
            console.error('Error updating engagement:', error);
            setSnackbar({
                open: true,
                message: 'Failed to update engagement: ' + (error.response?.data?.message || error.message),
                severity: 'error'
            });
            throw error;
        }
    };
    
    const handleDeleteClick = (engagement) => {
        setEngagementToDelete(engagement);
        setDeleteDialogOpen(true);
    };
    
    const handleDeleteClose = () => {
        setDeleteDialogOpen(false);
        setEngagementToDelete(null);
    };
    
    const handleDeleteConfirm = async () => {
        if (!engagementToDelete) return;
        
        try {
            await axios.delete(`engagements/${engagementToDelete.engagement_id}`);
            
            // Remove from state
            setEngagements(prev => prev.filter(e => e.engagement_id !== engagementToDelete.engagement_id));
            
            setSnackbar({
                open: true,
                message: 'Engagement deleted successfully',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error deleting engagement:', error);
            setSnackbar({
                open: true,
                message: 'Failed to delete engagement: ' + (error.response?.data?.message || error.message),
                severity: 'error'
            });
        } finally {
            handleDeleteClose();
        }
    };
    
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    // Calculate pagination
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredEngagements.length) : 0;
    const paginatedEngagements = sortedEngagements.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Engagement Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        placeholder="Search engagements..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            width: '300px',
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '20px',
                            }
                        }}
                    />
                    <Button 
                        variant="outlined" 
                        startIcon={<FilterIcon />}
                        onClick={handleFilterToggle}
                        color={Object.values(filters).some(f => f.length > 0) ? "primary" : "inherit"}
                    >
                        Filters
                        {Object.values(filters).some(f => f.length > 0) && (
                            <Chip 
                                size="small" 
                                label={Object.values(filters).flat().length} 
                                color="primary" 
                                sx={{ ml: 1 }}
                            />
                        )}
                    </Button>
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/engagements/create')}
                    >
                        Add Engagement
                    </Button>
                </Box>
            </Box>
            
            {/* Filter Panel */}
            {filterOpen && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">Filters</Typography>
                            <Button size="small" onClick={clearFilters}>Clear All</Button>
                        </Box>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" gutterBottom>Engagement Type</Typography>
                                <FormGroup>
                                    {filterOptions.engagement_type.map(type => (
                                        <FormControlLabel 
                                            key={type}
                                            control={
                                                <Checkbox 
                                                    checked={filters.engagement_type.includes(type)}
                                                    onChange={() => handleFilterChange('engagement_type', type)}
                                                    size="small"
                                                />
                                            } 
                                            label={type} 
                                        />
                                    ))}
                                </FormGroup>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" gutterBottom>Status</Typography>
                                <FormGroup>
                                    {filterOptions.engagement_status.map(status => (
                                        <FormControlLabel 
                                            key={status}
                                            control={
                                                <Checkbox 
                                                    checked={filters.engagement_status.includes(status)}
                                                    onChange={() => handleFilterChange('engagement_status', status)}
                                                    size="small"
                                                />
                                            } 
                                            label={status} 
                                        />
                                    ))}
                                </FormGroup>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" gutterBottom>Department</Typography>
                                <FormGroup>
                                    {filterOptions.engaged_department.map(dept => (
                                        <FormControlLabel 
                                            key={dept}
                                            control={
                                                <Checkbox 
                                                    checked={filters.engaged_department.includes(dept)}
                                                    onChange={() => handleFilterChange('engaged_department', dept)}
                                                    size="small"
                                                />
                                            } 
                                            label={dept} 
                                        />
                                    ))}
                                </FormGroup>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}
            
            <TableContainer component={Paper} sx={{ 
                borderRadius: 2,
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                overflow: 'hidden'
            }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'engagement_name'}
                                    direction={orderBy === 'engagement_name' ? order : 'asc'}
                                    onClick={createSortHandler('engagement_name')}
                                >
                                    Engagement Name
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'vendor_name'}
                                    direction={orderBy === 'vendor_name' ? order : 'asc'}
                                    onClick={createSortHandler('vendor_name')}
                                >
                                    Vendor
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'engagement_type'}
                                    direction={orderBy === 'engagement_type' ? order : 'asc'}
                                    onClick={createSortHandler('engagement_type')}
                                >
                                    Type
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'start_date'}
                                    direction={orderBy === 'start_date' ? order : 'asc'}
                                    onClick={createSortHandler('start_date')}
                                >
                                    Start Date
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'end_date'}
                                    direction={orderBy === 'end_date' ? order : 'asc'}
                                    onClick={createSortHandler('end_date')}
                                >
                                    End Date
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'engagement_status'}
                                    direction={orderBy === 'engagement_status' ? order : 'asc'}
                                    onClick={createSortHandler('engagement_status')}
                                >
                                    Status
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedEngagements.map((engagement) => (
                            <TableRow key={engagement.engagement_id}>
                                <TableCell>{engagement.engagement_name}</TableCell>
                                <TableCell>{engagement.vendor_name}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={engagement.engagement_type}
                                        color="primary"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {engagement.start_date ? new Date(engagement.start_date).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    }).replace(/ /g, '-') : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    {engagement.end_date ? new Date(engagement.end_date).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    }).replace(/ /g, '-') : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={engagement.engagement_status}
                                        color={getStatusColor(engagement.engagement_status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton 
                                        size="small" 
                                        color="primary"
                                        onClick={() => handleEditClick(engagement)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        size="small" 
                                        color="error"
                                        onClick={() => handleDeleteClick(engagement)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {emptyRows > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                                <TableCell colSpan={7} />
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredEngagements.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
            
            {/* Edit Modal */}
            <EditEngagement
                open={editModalOpen}
                onClose={handleEditClose}
                engagement={currentEngagement}
                onSave={handleSaveEngagement}
            />
            
            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteClose}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete engagement "{engagementToDelete?.engagement_name}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity} 
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
} 