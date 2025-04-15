import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

// Mock data for workflows
const mockWorkflows = [
  {
    id: 1,
    name: 'Vendor Approval Workflow',
    description: 'Approval process for new vendor registrations',
    formType: 'vendor',
    status: 'active',
    createdAt: '2025-03-15T10:30:00',
    updatedAt: '2025-03-16T14:22:00',
    approverCount: 3,
  },
  {
    id: 2,
    name: 'High Value Expense Approval',
    description: 'Multi-level approval for expenses over $1000',
    formType: 'expense',
    status: 'active',
    createdAt: '2025-03-10T08:15:00',
    updatedAt: '2025-03-10T08:15:00',
    approverCount: 4,
  },
  {
    id: 3,
    name: 'Contract Renewal Workflow',
    description: 'Approval chain for vendor contract renewals',
    formType: 'engagement',
    status: 'inactive',
    createdAt: '2025-02-28T16:45:00',
    updatedAt: '2025-03-05T11:20:00',
    approverCount: 2,
  },
  {
    id: 4,
    name: 'Emergency Vendor Addition',
    description: 'Expedited approval for urgent vendor additions',
    formType: 'vendor',
    status: 'active',
    createdAt: '2025-03-18T09:10:00',
    updatedAt: '2025-03-18T09:10:00',
    approverCount: 1,
  },
  {
    id: 5,
    name: 'IT Equipment Purchase',
    description: 'IT department approval workflow for tech purchases',
    formType: 'expense',
    status: 'inactive',
    createdAt: '2025-01-15T14:30:00',
    updatedAt: '2025-02-10T10:15:00',
    approverCount: 3,
  },
];

const ManageWorkflow = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workflows, setWorkflows] = useState([...mockWorkflows]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formTypeFilter, setFormTypeFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load workflows on component mount
  useEffect(() => {
    // In a real application, you would fetch data from your API here
    // For this example, we're using mock data
    setWorkflows([...mockWorkflows]);
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleActionClick = (event, id) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedWorkflowId(id);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setSelectedWorkflowId(null);
  };

  const handleDeleteClick = () => {
    handleActionClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setWorkflows(workflows.filter(workflow => workflow.id !== selectedWorkflowId));
    setDeleteDialogOpen(false);
    setSnackbar({
      open: true,
      message: 'Workflow deleted successfully',
      severity: 'success',
    });
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedWorkflowId(null);
  };

  const handleEditWorkflow = () => {
    handleActionClose();
    navigate(`/workflows/edit/${selectedWorkflowId}`);
  };

  const handleToggleStatus = () => {
    setWorkflows(workflows.map(workflow => 
      workflow.id === selectedWorkflowId 
        ? { ...workflow, status: workflow.status === 'active' ? 'inactive' : 'active' } 
        : workflow
    ));
    handleActionClose();
    setSnackbar({
      open: true,
      message: `Workflow ${workflows.find(w => w.id === selectedWorkflowId)?.status === 'active' ? 'deactivated' : 'activated'} successfully`,
      severity: 'success',
    });
  };

  const handleCreateWorkflow = () => {
    navigate('/workflows/create');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    handleFilterClose();
    setPage(0);
  };

  const handleFormTypeFilterChange = (formType) => {
    setFormTypeFilter(formType);
    handleFilterClose();
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setFormTypeFilter('all');
    handleFilterClose();
    setPage(0);
  };

  // Filter workflows based on search term and filters
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    const matchesFormType = formTypeFilter === 'all' || workflow.formType === formTypeFilter;
    
    return matchesSearch && matchesStatus && matchesFormType;
  });

  // Format date strings
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="div">
            Manage Workflows
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateWorkflow}
          >
            Create Workflow
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              size="small"
              variant="outlined"
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              size="small"
              startIcon={<FilterListIcon />}
              onClick={handleFilterClick}
              sx={{ ml: 2 }}
            >
              Filters
              {(statusFilter !== 'all' || formTypeFilter !== 'all') && (
                <Chip
                  size="small"
                  label={
                    (statusFilter !== 'all' && formTypeFilter !== 'all')
                      ? '2'
                      : '1'
                  }
                  color="primary"
                  sx={{ ml: 1, height: 20, width: 20 }}
                />
              )}
            </Button>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
            >
              <MenuItem disabled>
                <Typography variant="subtitle2">Status</Typography>
              </MenuItem>
              <MenuItem
                selected={statusFilter === 'all'}
                onClick={() => handleStatusFilterChange('all')}
              >
                All Statuses
              </MenuItem>
              <MenuItem
                selected={statusFilter === 'active'}
                onClick={() => handleStatusFilterChange('active')}
              >
                Active
              </MenuItem>
              <MenuItem
                selected={statusFilter === 'inactive'}
                onClick={() => handleStatusFilterChange('inactive')}
              >
                Inactive
              </MenuItem>
              <MenuItem divider disabled>
                <Typography variant="subtitle2">Form Type</Typography>
              </MenuItem>
              <MenuItem
                selected={formTypeFilter === 'all'}
                onClick={() => handleFormTypeFilterChange('all')}
              >
                All Form Types
              </MenuItem>
              <MenuItem
                selected={formTypeFilter === 'vendor'}
                onClick={() => handleFormTypeFilterChange('vendor')}
              >
                Vendor Form
              </MenuItem>
              <MenuItem
                selected={formTypeFilter === 'engagement'}
                onClick={() => handleFormTypeFilterChange('engagement')}
              >
                Engagement Form
              </MenuItem>
              <MenuItem
                selected={formTypeFilter === 'expense'}
                onClick={() => handleFormTypeFilterChange('expense')}
              >
                Expense Form
              </MenuItem>
              <MenuItem divider />
              <MenuItem onClick={handleClearFilters}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <RefreshIcon fontSize="small" sx={{ mr: 1 }} />
                  Clear Filters
                </Box>
              </MenuItem>
            </Menu>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {filteredWorkflows.length} workflow{filteredWorkflows.length !== 1 ? 's' : ''} found
            </Typography>
          </Box>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-label="workflow table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Form Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Approvers</TableCell>
                <TableCell>Last Modified</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWorkflows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((workflow) => (
                  <TableRow key={workflow.id} hover>
                    <TableCell component="th" scope="row">
                      {workflow.name}
                    </TableCell>
                    <TableCell>{workflow.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={workflow.formType === 'vendor' ? 'Vendor Form' : 
                               workflow.formType === 'engagement' ? 'Engagement Form' : 
                               'Expense Form'}
                        size="small"
                        color={workflow.formType === 'vendor' ? 'primary' : 
                               workflow.formType === 'engagement' ? 'secondary' : 
                               'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={workflow.status === 'active' ? 'Active' : 'Inactive'}
                        size="small"
                        color={workflow.status === 'active' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{workflow.approverCount}</TableCell>
                    <TableCell>
                      <Tooltip title={formatDate(workflow.updatedAt)}>
                        <span>{new Date(workflow.updatedAt).toLocaleDateString()}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(event) => handleActionClick(event, workflow.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredWorkflows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No workflows found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Try adjusting your search or filters
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredWorkflows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleActionClose}
      >
        <MenuItem onClick={handleEditWorkflow}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          {workflows.find(w => w.id === selectedWorkflowId)?.status === 'active' ? (
            <>
              <PauseIcon fontSize="small" sx={{ mr: 1 }} />
              Deactivate
            </>
          ) : (
            <>
              <PlayArrowIcon fontSize="small" sx={{ mr: 1 }} />
              Activate
            </>
          )}
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Workflow</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this workflow? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
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
};

export default ManageWorkflow;