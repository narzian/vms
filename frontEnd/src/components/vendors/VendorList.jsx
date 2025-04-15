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
    Drawer,
    Divider,
    Grid,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Alert,
    Snackbar,
    Card,
    CardContent,
    FormGroup,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    Search as SearchIcon, 
    FilterList as FilterIcon,
    Close as CloseIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';

export default function VendorList() {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredVendors, setFilteredVendors] = useState([]);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('vendor_name');
    
    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // Filter states
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        vendor_type: [],
        vendor_tier: [],
        vendor_status: []
    });
    
    // Edit drawer
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [currentVendor, setCurrentVendor] = useState(null);
    
    // Delete dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [vendorToDelete, setVendorToDelete] = useState(null);
    
    // Snackbar
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    
    // Filter options
    const [filterOptions, setFilterOptions] = useState({
        vendor_type: [],
        vendor_tier: [],
        vendor_status: []
    });

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const response = await axios.get('vendors');
                setVendors(response.data);
                setFilteredVendors(response.data);
                
                // Extract filter options
                const types = [...new Set(response.data.map(v => v.vendor_type))].filter(Boolean);
                const tiers = [...new Set(response.data.map(v => v.vendor_tier))].filter(Boolean);
                const statuses = [...new Set(response.data.map(v => v.vendor_status))].filter(Boolean);
                
                setFilterOptions({
                    vendor_type: types,
                    vendor_tier: tiers,
                    vendor_status: statuses
                });
            } catch (error) {
                console.error('Error fetching vendors:', error);
                setSnackbar({
                    open: true,
                    message: 'Failed to fetch vendors: ' + (error.response?.data?.message || error.message),
                    severity: 'error'
                });
            }
        };
        fetchVendors();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [vendors, searchTerm, filters]);

    const applyFilters = () => {
        let filtered = vendors;
        
        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(vendor =>
                vendor.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Apply category filters
        Object.keys(filters).forEach(filterKey => {
            if (filters[filterKey].length > 0) {
                filtered = filtered.filter(vendor => 
                    filters[filterKey].includes(vendor[filterKey])
                );
            }
        });
        
        setFilteredVendors(filtered);
        setPage(0); // Reset to first page when filters change
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortedVendors = React.useMemo(() => {
        const stabilizedThis = filteredVendors.map((el, index) => [el, index]);
        stabilizedThis.sort((a, b) => {
            const aValue = a[0][orderBy] || '';
            const bValue = b[0][orderBy] || '';
            
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
    }, [filteredVendors, order, orderBy]);

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
            vendor_type: [],
            vendor_tier: [],
            vendor_status: []
        });
        setSearchTerm('');
    };
    
    const handleEditClick = (vendor) => {
        setCurrentVendor(vendor);
        setEditDrawerOpen(true);
    };
    
    const handleEditClose = () => {
        setEditDrawerOpen(false);
        setCurrentVendor(null);
    };
    
    const handleDeleteClick = (vendor) => {
        setVendorToDelete(vendor);
        setDeleteDialogOpen(true);
    };
    
    const handleDeleteClose = () => {
        setDeleteDialogOpen(false);
        setVendorToDelete(null);
    };
    
    const handleDeleteConfirm = async () => {
        if (!vendorToDelete) return;
        
        try {
            await axios.delete(`vendors/${vendorToDelete.vendor_id}`);
            
            // Remove from state
            setVendors(prev => prev.filter(v => v.vendor_id !== vendorToDelete.vendor_id));
            
            setSnackbar({
                open: true,
                message: 'Vendor deleted successfully',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error deleting vendor:', error);
            setSnackbar({
                open: true,
                message: 'Failed to delete vendor: ' + (error.response?.data?.message || error.message),
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
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredVendors.length) : 0;
    const paginatedVendors = sortedVendors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Vendor Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        placeholder="Search vendors..."
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
                        onClick={() => navigate('/vendors/create')}
                    >
                        Add Vendor
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
                                <Typography variant="subtitle2" gutterBottom>Vendor Type</Typography>
                                <FormGroup>
                                    {filterOptions.vendor_type.map(type => (
                                        <FormControlLabel 
                                            key={type}
                                            control={
                                                <Checkbox 
                                                    checked={filters.vendor_type.includes(type)}
                                                    onChange={() => handleFilterChange('vendor_type', type)}
                                                    size="small"
                                                />
                                            } 
                                            label={type} 
                                        />
                                    ))}
                                </FormGroup>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" gutterBottom>Vendor Tier</Typography>
                                <FormGroup>
                                    {filterOptions.vendor_tier.map(tier => (
                                        <FormControlLabel 
                                            key={tier}
                                            control={
                                                <Checkbox 
                                                    checked={filters.vendor_tier.includes(tier)}
                                                    onChange={() => handleFilterChange('vendor_tier', tier)}
                                                    size="small"
                                                />
                                            } 
                                            label={tier} 
                                        />
                                    ))}
                                </FormGroup>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" gutterBottom>Status</Typography>
                                <FormGroup>
                                    {filterOptions.vendor_status.map(status => (
                                        <FormControlLabel 
                                            key={status}
                                            control={
                                                <Checkbox 
                                                    checked={filters.vendor_status.includes(status)}
                                                    onChange={() => handleFilterChange('vendor_status', status)}
                                                    size="small"
                                                />
                                            } 
                                            label={status} 
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
                                    active={orderBy === 'vendor_name'}
                                    direction={orderBy === 'vendor_name' ? order : 'asc'}
                                    onClick={createSortHandler('vendor_name')}
                                >
                                    Vendor Name
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'vendor_type'}
                                    direction={orderBy === 'vendor_type' ? order : 'asc'}
                                    onClick={createSortHandler('vendor_type')}
                                >
                                    Type
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'vendor_tier'}
                                    direction={orderBy === 'vendor_tier' ? order : 'asc'}
                                    onClick={createSortHandler('vendor_tier')}
                                >
                                    Tier
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'vendor_status'}
                                    direction={orderBy === 'vendor_status' ? order : 'asc'}
                                    onClick={createSortHandler('vendor_status')}
                                >
                                    Status
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'created_at'}
                                    direction={orderBy === 'created_at' ? order : 'asc'}
                                    onClick={createSortHandler('created_at')}
                                >
                                    Created Date
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedVendors.map((vendor) => (
                            <TableRow key={vendor.vendor_id}>
                                <TableCell>{vendor.vendor_name}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={vendor.vendor_type}
                                        color="primary"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={vendor.vendor_tier}
                                        color="secondary"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={vendor.vendor_status}
                                        color={vendor.vendor_status === 'Active' ? 'success' : 
                                               vendor.vendor_status === 'Inactive' ? 'error' : 'warning'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(vendor.created_at).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    }).replace(/ /g, '-')}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton 
                                        size="small" 
                                        color="primary"
                                        onClick={() => handleEditClick(vendor)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        size="small" 
                                        color="error"
                                        onClick={() => handleDeleteClick(vendor)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {emptyRows > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                                <TableCell colSpan={6} />
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredVendors.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
            
            {/* Edit Drawer */}
            <Drawer
                anchor="right"
                open={editDrawerOpen}
                onClose={handleEditClose}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: { xs: '100%', sm: 500 },
                        padding: 3
                    }
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">Edit Vendor</Typography>
                    <IconButton onClick={handleEditClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                {currentVendor && (
                    <Box component="form">
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Vendor Name"
                                    value={currentVendor.vendor_name}
                                    onChange={(e) => setCurrentVendor({...currentVendor, vendor_name: e.target.value})}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Vendor Type</InputLabel>
                                    <Select
                                        value={currentVendor.vendor_type}
                                        label="Vendor Type"
                                        onChange={(e) => setCurrentVendor({...currentVendor, vendor_type: e.target.value})}
                                    >
                                        {filterOptions.vendor_type.map(type => (
                                            <MenuItem key={type} value={type}>{type}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Vendor Tier</InputLabel>
                                    <Select
                                        value={currentVendor.vendor_tier}
                                        label="Vendor Tier"
                                        onChange={(e) => setCurrentVendor({...currentVendor, vendor_tier: e.target.value})}
                                    >
                                        {filterOptions.vendor_tier.map(tier => (
                                            <MenuItem key={tier} value={tier}>{tier}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={currentVendor.vendor_status}
                                        label="Status"
                                        onChange={(e) => setCurrentVendor({...currentVendor, vendor_status: e.target.value})}
                                    >
                                        {filterOptions.vendor_status.map(status => (
                                            <MenuItem key={status} value={status}>{status}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sx={{ mt: 3 }}>
                                <Button 
                                    variant="contained" 
                                    fullWidth
                                    onClick={async () => {
                                        try {
                                            await axios.put(`vendors/${currentVendor.vendor_id}`, currentVendor);
                                            
                                            // Update state
                                            setVendors(prev => prev.map(v => 
                                                v.vendor_id === currentVendor.vendor_id ? currentVendor : v
                                            ));
                                            
                                            setSnackbar({
                                                open: true,
                                                message: 'Vendor updated successfully',
                                                severity: 'success'
                                            });
                                            
                                            handleEditClose();
                                        } catch (error) {
                                            console.error('Error updating vendor:', error);
                                            setSnackbar({
                                                open: true,
                                                message: 'Failed to update vendor: ' + (error.response?.data?.message || error.message),
                                                severity: 'error'
                                            });
                                        }
                                    }}
                                >
                                    Save Changes
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Drawer>
            
            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteClose}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete vendor "{vendorToDelete?.vendor_name}"? This action cannot be undone.
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