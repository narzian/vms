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
    Receipt as ReceiptIcon,
    FilterList as FilterIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import EditExpense from './EditExpense';

export default function ExpenseList() {
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('expense_id');
    
    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // Filter states
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        expense_category: [],
        expense_status: [],
        vendor_name: []
    });
    
    // Filter options
    const [filterOptions, setFilterOptions] = useState({
        expense_category: [],
        expense_status: [],
        vendor_name: []
    });
    
    // Edit modal
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentExpense, setCurrentExpense] = useState(null);
    
    // Delete dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    
    // Snackbar
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const response = await axios.get('expenses');
                console.log('Expenses data:', response.data);
                setExpenses(response.data);
                setFilteredExpenses(response.data);
                
                // Extract filter options
                const categories = [...new Set(response.data.map(e => e.expense_category))].filter(Boolean);
                const statuses = [...new Set(response.data.map(e => e.expense_status))].filter(Boolean);
                const vendors = [...new Set(response.data.map(e => e.vendor_name))].filter(Boolean);
                
                setFilterOptions({
                    expense_category: categories,
                    expense_status: statuses,
                    vendor_name: vendors
                });
            } catch (error) {
                console.error('Error fetching expenses:', error);
                setSnackbar({
                    open: true,
                    message: 'Failed to fetch expenses: ' + (error.response?.data?.message || error.message),
                    severity: 'error'
                });
            }
        };
        fetchExpenses();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [expenses, searchTerm, filters]);

    const applyFilters = () => {
        let filtered = expenses;
        
        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(expense =>
                (expense.engagement_name && expense.engagement_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (expense.vendor_name && expense.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (expense.expense_category && expense.expense_category.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        
        // Apply category filters
        Object.keys(filters).forEach(filterKey => {
            if (filters[filterKey].length > 0) {
                filtered = filtered.filter(expense => 
                    expense[filterKey] && filters[filterKey].includes(expense[filterKey])
                );
            }
        });
        
        setFilteredExpenses(filtered);
        setPage(0); // Reset to first page when filters change
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const getStatusColor = (status) => {
        if (!status) return 'default';
        switch (status.toLowerCase()) {
            case 'approved':
                return 'success';
            case 'pending':
                return 'warning';
            case 'rejected':
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

    const sortedExpenses = React.useMemo(() => {
        const stabilizedThis = filteredExpenses.map((el, index) => [el, index]);
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
    }, [filteredExpenses, order, orderBy]);

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
            expense_category: [],
            expense_status: [],
            vendor_name: []
        });
        setSearchTerm('');
    };
    
    const handleEditClick = (expense) => {
        setCurrentExpense(expense);
        setEditModalOpen(true);
    };
    
    const handleEditClose = () => {
        setEditModalOpen(false);
        setCurrentExpense(null);
    };
    
    const handleSaveExpense = async (updatedExpense) => {
        try {
            const response = await axios.put(`expenses/${updatedExpense.expense_id}`, updatedExpense);
            
            // Update state
            setExpenses(prev => prev.map(e => 
                e.expense_id === updatedExpense.expense_id ? response.data : e
            ));
            
            setSnackbar({
                open: true,
                message: 'Expense updated successfully',
                severity: 'success'
            });
            
            return response.data;
        } catch (error) {
            console.error('Error updating expense:', error);
            setSnackbar({
                open: true,
                message: 'Failed to update expense: ' + (error.response?.data?.message || error.message),
                severity: 'error'
            });
            throw error;
        }
    };
    
    const handleDeleteClick = (expense) => {
        setExpenseToDelete(expense);
        setDeleteDialogOpen(true);
    };
    
    const handleDeleteClose = () => {
        setDeleteDialogOpen(false);
        setExpenseToDelete(null);
    };
    
    const handleDeleteConfirm = async () => {
        if (!expenseToDelete) return;
        
        try {
            await axios.delete(`expenses/${expenseToDelete.expense_id}`);
            
            // Remove from state
            setExpenses(prev => prev.filter(e => e.expense_id !== expenseToDelete.expense_id));
            
            setSnackbar({
                open: true,
                message: 'Expense deleted successfully',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error deleting expense:', error);
            setSnackbar({
                open: true,
                message: 'Failed to delete expense: ' + (error.response?.data?.message || error.message),
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
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredExpenses.length) : 0;
    const paginatedExpenses = sortedExpenses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Expense Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        placeholder="Search expenses..."
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
                        onClick={() => navigate('/expenses/create')}
                    >
                        Add Expense
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
                                <Typography variant="subtitle2" gutterBottom>Expense Category</Typography>
                                <FormGroup>
                                    {filterOptions.expense_category.map(category => (
                                        <FormControlLabel 
                                            key={category}
                                            control={
                                                <Checkbox 
                                                    checked={filters.expense_category.includes(category)}
                                                    onChange={() => handleFilterChange('expense_category', category)}
                                                    size="small"
                                                />
                                            } 
                                            label={category} 
                                        />
                                    ))}
                                </FormGroup>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" gutterBottom>Status</Typography>
                                <FormGroup>
                                    {filterOptions.expense_status.map(status => (
                                        <FormControlLabel 
                                            key={status}
                                            control={
                                                <Checkbox 
                                                    checked={filters.expense_status.includes(status)}
                                                    onChange={() => handleFilterChange('expense_status', status)}
                                                    size="small"
                                                />
                                            } 
                                            label={status} 
                                        />
                                    ))}
                                </FormGroup>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" gutterBottom>Vendor</Typography>
                                <FormGroup>
                                    {filterOptions.vendor_name.map(vendor => (
                                        <FormControlLabel 
                                            key={vendor}
                                            control={
                                                <Checkbox 
                                                    checked={filters.vendor_name.includes(vendor)}
                                                    onChange={() => handleFilterChange('vendor_name', vendor)}
                                                    size="small"
                                                />
                                            } 
                                            label={vendor} 
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
                                    Engagement
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'expense_amount'}
                                    direction={orderBy === 'expense_amount' ? order : 'asc'}
                                    onClick={createSortHandler('expense_amount')}
                                >
                                    Amount
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'expense_category'}
                                    direction={orderBy === 'expense_category' ? order : 'asc'}
                                    onClick={createSortHandler('expense_category')}
                                >
                                    Category
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
                                    active={orderBy === 'expense_start_date'}
                                    direction={orderBy === 'expense_start_date' ? order : 'asc'}
                                    onClick={createSortHandler('expense_start_date')}
                                >
                                    Start Date
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'expense_end_date'}
                                    direction={orderBy === 'expense_end_date' ? order : 'asc'}
                                    onClick={createSortHandler('expense_end_date')}
                                >
                                    End Date
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'expense_status'}
                                    direction={orderBy === 'expense_status' ? order : 'asc'}
                                    onClick={createSortHandler('expense_status')}
                                >
                                    Status
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedExpenses.length > 0 ? (
                            paginatedExpenses.map((expense) => (
                                <TableRow key={expense.expense_id}>
                                    <TableCell>{expense.engagement_name || 'N/A'}</TableCell>
                                    <TableCell>{formatCurrency(expense.expense_amount)}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={expense.expense_category || 'N/A'}
                                            color="primary"
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{expense.vendor_name || 'N/A'}</TableCell>
                                    <TableCell>
                                        {expense.expense_start_date ? 
                                            new Date(expense.expense_start_date).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            }).replace(/ /g, '-') : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {expense.expense_end_date ? 
                                            new Date(expense.expense_end_date).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            }).replace(/ /g, '-') : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={expense.expense_status || 'N/A'}
                                            color={getStatusColor(expense.expense_status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton 
                                            size="small" 
                                            color="primary"
                                            onClick={() => handleEditClick(expense)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton 
                                            size="small" 
                                            color="error"
                                            onClick={() => handleDeleteClick(expense)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center">No expenses found</TableCell>
                            </TableRow>
                        )}
                        {emptyRows > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                                <TableCell colSpan={8} />
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredExpenses.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
            
            {/* Edit Modal */}
            <EditExpense
                open={editModalOpen}
                onClose={handleEditClose}
                expense={currentExpense}
                onSave={handleSaveExpense}
            />
            
            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteClose}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this expense? This action cannot be undone.
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