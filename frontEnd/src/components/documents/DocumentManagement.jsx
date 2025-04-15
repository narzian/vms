import React, { useState, useEffect, useMemo } from "react";
import axios from "../../utils/axios";
import CardContainer from "../reusable/CardContainer";
import {
  Typography,
  Box,
  Grid,
  Divider,
  Breadcrumbs,
  Link,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  CircularProgress,
  Chip,
  Alert,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  Folder as FolderIcon,
  Description as DocumentIcon,
  NavigateNext as NavigateNextIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  GetApp as DownloadIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  SortByAlpha as SortIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Receipt as ReceiptIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import ButtonField from "../reusable/ButtonField";

// Document type icons mapping
const documentTypeIcons = {
  "application/pdf": <DocumentIcon sx={{ color: "#F40F02" }} />,
  "image/jpeg": <DocumentIcon sx={{ color: "#007ACC" }} />,
  "image/png": <DocumentIcon sx={{ color: "#007ACC" }} />,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (
    <DocumentIcon sx={{ color: "#185ABD" }} />
  ),
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": (
    <DocumentIcon sx={{ color: "#107C41" }} />
  ),
  "text/plain": <DocumentIcon sx={{ color: "#7F7F7F" }} />,
  "default": <DocumentIcon />,
};

const DocumentManagement = () => {
  const [currentPath, setCurrentPath] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("name_asc");
  const [anchorElSort, setAnchorElSort] = useState(null);
  const [anchorElFilter, setAnchorElFilter] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [anchorElActions, setAnchorElActions] = useState(null);
  const [viewDocument, setViewDocument] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch data based on current path
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let endpoint = "documents";
        
        // Build endpoint based on current path
        if (currentPath.length > 0) {
          const pathParams = currentPath.map(item => `${item.type}=${item.id}`).join("&");
          endpoint += `?${pathParams}`;
        }
        
        const response = await axios.get(endpoint);
        
        // Set folders based on current level
        if (currentPath.length === 0) {
          // Root level - show vendors
          setFolders(response.data.vendors || []);
          setDocuments([]);
        } else if (currentPath.length === 1) {
          // Vendor level - show engagements
          setFolders(response.data.engagements || []);
          setDocuments(response.data.documents || []);
        } else if (currentPath.length === 2) {
          // Engagement level - show expenses
          setFolders(response.data.expenses || []);
          setDocuments(response.data.documents || []);
        } else {
          // Expense level - show only documents
          setFolders([]);
          setDocuments(response.data.documents || []);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
        setSnackbar({
          open: true,
          message: `Failed to fetch documents: ${error.response?.data?.message || error.message}`,
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPath]);

  // Handle file download
  const handleDownload = async (document) => {
    try {
      const response = await axios.get(`documents/download/${document.id}`, {
        responseType: "blob",
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", document.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSnackbar({
        open: true,
        message: "Document downloaded successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error downloading document:", error);
      setSnackbar({
        open: true,
        message: `Failed to download document: ${error.response?.data?.message || error.message}`,
        severity: "error",
      });
    }
  };

  // Handle document view
  const handleView = (document) => {
    setViewDocument(document);
  };

  // Handle document deletion
  const handleDelete = async () => {
    if (!selectedItem) return;
    
    try {
      await axios.delete(`documents/${selectedItem.id}`);
      
      // Remove the document from the list
      setDocuments(documents.filter(doc => doc.id !== selectedItem.id));
      
      setSnackbar({
        open: true,
        message: "Document deleted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      setSnackbar({
        open: true,
        message: `Failed to delete document: ${error.response?.data?.message || error.message}`,
        severity: "error",
      });
    } finally {
      setOpenDeleteDialog(false);
      setSelectedItem(null);
      setAnchorElActions(null);
    }
  };

  // Handle folder navigation
  const handleFolderClick = (folder, level) => {
    let type;
    switch (level) {
      case 0:
        type = "vendor_id";
        break;
      case 1:
        type = "engagement_id";
        break;
      case 2:
        type = "expense_id";
        break;
      default:
        type = "";
    }
    
    const newPath = [...currentPath, { id: folder.id, name: folder.name, type }];
    setCurrentPath(newPath);
  };

  // Handle navigation through breadcrumbs
  const handleBreadcrumbClick = (index) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  // Handle going back to parent folder
  const handleBack = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, currentPath.length - 1));
    }
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle sort menu open
  const handleSortClick = (event) => {
    setAnchorElSort(event.currentTarget);
  };

  // Handle sort menu close
  const handleSortClose = () => {
    setAnchorElSort(null);
  };

  // Handle sort option selection
  const handleSortSelect = (order) => {
    setSortOrder(order);
    setAnchorElSort(null);
  };

  // Handle filter menu open
  const handleFilterClick = (event) => {
    setAnchorElFilter(event.currentTarget);
  };

  // Handle filter menu close
  const handleFilterClose = () => {
    setAnchorElFilter(null);
  };

  // Handle filter option selection
  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    setAnchorElFilter(null);
  };

  // Handle actions menu open
  const handleActionsClick = (event, item) => {
    setSelectedItem(item);
    setAnchorElActions(event.currentTarget);
  };

  // Handle actions menu close
  const handleActionsClose = () => {
    setAnchorElActions(null);
  };

  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Handle close view dialog
  const handleCloseView = () => {
    setViewDocument(null);
  };

  // Handle open delete dialog
  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
    setAnchorElActions(null);
  };

  // Handle close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  // Filter and sort the folders and documents
  const filteredAndSortedData = useMemo(() => {
    // Filter folders
    let filteredFolders = folders;
    if (searchQuery) {
      filteredFolders = folders.filter(folder => 
        folder.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter documents
    let filteredDocuments = documents;
    if (searchQuery) {
      filteredDocuments = documents.filter(doc => 
        doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply document type filter
    if (selectedFilter !== "all") {
      filteredDocuments = filteredDocuments.filter(doc => {
        if (selectedFilter === "pdf") return doc.file_type === "application/pdf";
        if (selectedFilter === "image") return doc.file_type.startsWith("image/");
        if (selectedFilter === "word") return doc.file_type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        if (selectedFilter === "excel") return doc.file_type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        if (selectedFilter === "text") return doc.file_type === "text/plain";
        return true;
      });
    }
    
    // Sort folders
    const sortedFolders = [...filteredFolders].sort((a, b) => {
      if (sortOrder === "name_asc") {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === "name_desc") {
        return b.name.localeCompare(a.name);
      } else if (sortOrder === "date_asc") {
        return new Date(a.created_at) - new Date(b.created_at);
      } else {
        return new Date(b.created_at) - new Date(a.created_at);
      }
    });
    
    // Sort documents
    const sortedDocuments = [...filteredDocuments].sort((a, b) => {
      if (sortOrder === "name_asc") {
        return a.file_name.localeCompare(b.file_name);
      } else if (sortOrder === "name_desc") {
        return b.file_name.localeCompare(a.file_name);
      } else if (sortOrder === "date_asc") {
        return new Date(a.upload_date) - new Date(b.upload_date);
      } else {
        return new Date(b.upload_date) - new Date(a.upload_date);
      }
    });
    
    return { folders: sortedFolders, documents: sortedDocuments };
  }, [folders, documents, searchQuery, sortOrder, selectedFilter]);

  // Get the folder icon based on the current level
  const getFolderIcon = (level) => {
    switch (level) {
      case 0:
        return <BusinessIcon color="primary" />;
      case 1:
        return <AssignmentIcon color="secondary" />;
      case 2:
        return <ReceiptIcon color="success" />;
      default:
        return <FolderIcon color="primary" />;
    }
  };

  // Get document type icon
  const getDocumentIcon = (fileType) => {
    return documentTypeIcons[fileType] || documentTypeIcons.default;
  };

  return (
    <Box sx={{ p: 2 }}>
      <CardContainer
        title="Document Management"
        icon={<ArticleIcon fontSize="medium" />}
        elevation={2}
      >
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Breadcrumbs 
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="document navigation breadcrumb"
              >
                <Link
                  underline="hover"
                  color="inherit"
                  href="#"
                  onClick={() => setCurrentPath([])}
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <ArticleIcon sx={{ mr: 0.5 }} fontSize="small" />
                  Documents
                </Link>
                {currentPath.map((item, index) => (
                  <Link
                    key={index}
                    underline="hover"
                    color={index === currentPath.length - 1 ? "text.primary" : "inherit"}
                    href="#"
                    onClick={() => handleBreadcrumbClick(index)}
                  >
                    {item.name}
                  </Link>
                ))}
              </Breadcrumbs>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mr: 1 }}
                />
                <Tooltip title="Sort documents">
                  <IconButton onClick={handleSortClick} size="small">
                    <SortIcon />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorElSort}
                  open={Boolean(anchorElSort)}
                  onClose={handleSortClose}
                >
                  <MenuItem onClick={() => handleSortSelect("name_asc")}>
                    Name (A-Z)
                  </MenuItem>
                  <MenuItem onClick={() => handleSortSelect("name_desc")}>
                    Name (Z-A)
                  </MenuItem>
                  <MenuItem onClick={() => handleSortSelect("date_desc")}>
                    Newest First
                  </MenuItem>
                  <MenuItem onClick={() => handleSortSelect("date_asc")}>
                    Oldest First
                  </MenuItem>
                </Menu>
                <Tooltip title="Filter documents">
                  <IconButton onClick={handleFilterClick} size="small">
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorElFilter}
                  open={Boolean(anchorElFilter)}
                  onClose={handleFilterClose}
                >
                  <MenuItem onClick={() => handleFilterSelect("all")}>
                    All Documents
                  </MenuItem>
                  <MenuItem onClick={() => handleFilterSelect("pdf")}>
                    PDF Documents
                  </MenuItem>
                  <MenuItem onClick={() => handleFilterSelect("image")}>
                    Images
                  </MenuItem>
                  <MenuItem onClick={() => handleFilterSelect("word")}>
                    Word Documents
                  </MenuItem>
                  <MenuItem onClick={() => handleFilterSelect("excel")}>
                    Excel Documents
                  </MenuItem>
                  <MenuItem onClick={() => handleFilterSelect("text")}>
                    Text Documents
                  </MenuItem>
                </Menu>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {currentPath.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <ButtonField
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  variant="text"
                  size="small"
                >
                  Back
                </ButtonField>
              </Box>
            )}

            <Paper elevation={0} variant="outlined" sx={{ mb: 2 }}>
              <List>
                {filteredAndSortedData.folders.length === 0 && filteredAndSortedData.documents.length === 0 ? (
                  <ListItem>
                    <ListItemText 
                      primary="No items found"
                      secondary={searchQuery ? "Try adjusting your search or filters" : "This folder is empty"}
                    />
                  </ListItem>
                ) : (
                  <>
                    {filteredAndSortedData.folders.map((folder) => (
                      <ListItemButton
                        key={folder.id}
                        onClick={() => handleFolderClick(folder, currentPath.length)}
                      >
                        <ListItemIcon>
                          {getFolderIcon(currentPath.length)}
                        </ListItemIcon>
                        <ListItemText 
                          primary={folder.name}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarIcon fontSize="small" sx={{ fontSize: 14 }} />
                              <Typography variant="caption">
                                {folder.created_at ? format(new Date(folder.created_at), "MMM d, yyyy") : "N/A"}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItemButton>
                    ))}

                    {filteredAndSortedData.folders.length > 0 && filteredAndSortedData.documents.length > 0 && (
                      <Divider />
                    )}

                    {filteredAndSortedData.documents.map((doc) => (
                      <ListItem
                        key={doc.id}
                        secondaryAction={
                          <IconButton 
                            edge="end" 
                            aria-label="actions"
                            onClick={(e) => handleActionsClick(e, doc)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          {getDocumentIcon(doc.file_type)}
                        </ListItemIcon>
                        <ListItemText 
                          primary={doc.file_name}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CalendarIcon fontSize="small" sx={{ fontSize: 14 }} />
                                <Typography variant="caption">
                                  {format(new Date(doc.upload_date), "MMM d, yyyy")}
                                </Typography>
                              </Box>
                              <Chip
                                label={doc.document_type || "General"}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </>
                )}
              </List>
            </Paper>

            <Box sx={{ mt: 2 }}>
              {selectedFilter !== "all" && (
                <Chip
                  label={`Filter: ${selectedFilter}`}
                  onDelete={() => setSelectedFilter("all")}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          </>
        )}
      </CardContainer>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorElActions}
        open={Boolean(anchorElActions)}
        onClose={handleActionsClose}
      >
        <MenuItem onClick={() => {
          handleView(selectedItem);
          handleActionsClose();
        }}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Document</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleDownload(selectedItem);
          handleActionsClose();
        }}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* View Document Dialog */}
      <Dialog
        open={Boolean(viewDocument)}
        onClose={handleCloseView}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {viewDocument?.file_name}
        </DialogTitle>
        <DialogContent>
          {viewDocument?.file_type.startsWith("image/") ? (
            <Box sx={{ textAlign: 'center' }}>
              <img 
                src={`/api/documents/view/${viewDocument?.id}`} 
                alt={viewDocument?.file_name}
                style={{ maxWidth: '100%', maxHeight: '70vh' }}
              />
            </Box>
          ) : viewDocument?.file_type === "application/pdf" ? (
            <Box sx={{ height: '70vh' }}>
              <iframe
                src={`/api/documents/view/${viewDocument?.id}`}
                width="100%"
                height="100%"
                title={viewDocument?.file_name}
              />
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Preview not available for this file type.
              </Typography>
              <ButtonField
                onClick={() => handleDownload(viewDocument)}
                startIcon={<DownloadIcon />}
                variant="contained"
                sx={{ mt: 2 }}
              >
                Download File
              </ButtonField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <ButtonField onClick={handleCloseView}>Close</ButtonField>
          <ButtonField 
            onClick={() => handleDownload(viewDocument)}
            startIcon={<DownloadIcon />}
          >
            Download
          </ButtonField>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the document "{selectedItem?.file_name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <ButtonField onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </ButtonField>
          <ButtonField onClick={handleDelete} color="error">
            Delete
          </ButtonField>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentManagement;