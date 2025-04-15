import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Add as AddIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import SelectField from "./SelectField";

const DocumentUpload = ({
  documents = [],
  setDocuments,
  formData = {},
  setFormData,
  formType = "vendor", // Default to vendor if not provided
}) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [documentCategory, setDocumentCategory] = useState("");
  const [error, setError] = useState("");
  const [hasValidity, setHasValidity] = useState(false);
  const [validityStartDate, setValidityStartDate] = useState(null);
  const [validityEndDate, setValidityEndDate] = useState(null);
  const [documentCategories, setDocumentCategories] = useState([]);

  useEffect(() => {
    setDocumentCategories([]); // Reset before fetching new data
    const fetchDocumentCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/document-categories",
          {
            params: { formType },
          }
        );
   
        if (Array.isArray(response.data)) {
          setDocumentCategories(response.data);
        } else {
          console.error("Unexpected response format:", response.data);
          setError("Error loading document categories");
        }
      } catch (error) {
        console.error("Error fetching document categories:", error);
        setError("Failed to load document categories");
      }
    };
  
    if (formType) {
      fetchDocumentCategories();
    } else {
      console.warn("No formType provided to DocumentUpload component");
    }
  }, [formType]);
  
  const handleFileUpload = (e) => {
    if (e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
      setError("");
    }
  };

  useEffect(() => {
    setDocumentCategory("");
  }, [formType]);

  const handleCategoryChange = (e) => {
    setDocumentCategory(e.target.value);
    setError("");

    // If formData and setFormData are provided, update them too
    if (setFormData && formData) {
      setFormData({
        ...formData,
        document_category: e.target.value,
      });
    }
  };

  const handleValidityChange = (event) => {
    setHasValidity(event.target.checked);
    if (!event.target.checked) {
      setValidityStartDate(null);
      setValidityEndDate(null);
    }
  };

  const handleStartDateChange = (date) => {
    setValidityStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setValidityEndDate(date);
  };

  const handleAddDocument = () => {
    const category =
      documentCategory || (formData && formData.document_category);

    if (!category) {
      setError("Please select a document category");
      return;
    }

    if (!uploadedFile) {
      setError("Please upload a document");
      return;
    }

    if (hasValidity && (!validityStartDate || !validityEndDate)) {
      setError("Please provide both start and end dates for validity period");
      return;
    }

    // Find the selected category object
    const selectedCategory = documentCategories.find(
      (cat) => cat.category_name === category
    );

    const newDocument = {
      file: uploadedFile,
      name: uploadedFile.name,
      categoryId: selectedCategory ? selectedCategory.category_id : null,
      categoryName: category, // Store the category name
      category: category, // For backward compatibility
      size: uploadedFile.size,
      type: uploadedFile.type,
      date: new Date().toISOString(),
      hasValidity: hasValidity,
      validityStartDate: hasValidity ? validityStartDate : null,
      validityEndDate: hasValidity ? validityEndDate : null,
    };

    setDocuments([...documents, newDocument]);
    setUploadedFile(null);
    setDocumentCategory("");
    setHasValidity(false);
    setValidityStartDate(null);
    setValidityEndDate(null);
    setError("");

    // If formData and setFormData are provided, update them too
    if (setFormData && formData) {
      setFormData({
        ...formData,
        document_category: "",
      });
    }
  };

  const handleRemoveDocument = (index) => {
    const newDocuments = [...documents];
    newDocuments.splice(index, 1);
    setDocuments(newDocuments);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return "N/A";

    const formatDate = (date) => {
      const d = new Date(date);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (
    <Box sx={{ width: "100%" }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <SelectField
            id="document_category"
            label="Document Category"
            value={
              documentCategory || (formData && formData.document_category) || ""
            }
            onChange={handleCategoryChange}
            options={documentCategories.map((cat) => cat.category_name || "")}
            placeholder="Select a category"
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Button
            component="label"
            variant="outlined"
            color="primary"
            fullWidth
            startIcon={<CloudUploadIcon />}
            sx={{
              py: 1.5,
              borderStyle: "dashed",
              borderWidth: "2px",
              textTransform: "none",
            }}
          >
            {uploadedFile ? "Change File" : "Upload Document"}
            <input
              type="file"
              hidden
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </Button>
        </Grid>

        <Grid item xs={12} md={4}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<AddIcon />}
            onClick={handleAddDocument}
            disabled={!uploadedFile}
            sx={{ py: 1.5, textTransform: "none" }}
          >
            Add Document
          </Button>
        </Grid>
      </Grid>

      {uploadedFile && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 1,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "primary.light",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <FileIcon color="primary" sx={{ mr: 1 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                {uploadedFile.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(uploadedFile.size)} •{" "}
                {uploadedFile.type.split("/")[1].toUpperCase()}
              </Typography>
            </Box>
            <Chip
              label="Ready to add"
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={hasValidity}
                onChange={handleValidityChange}
                color="primary"
              />
            }
            label="Document has validity period"
          />

          {hasValidity && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={2} mt={1}>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Validity Start Date"
                    value={validityStartDate}
                    onChange={handleStartDateChange}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth size="small" />
                    )}
                    inputFormat="dd/MM/yyyy"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Validity End Date"
                    value={validityEndDate}
                    onChange={handleEndDateChange}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth size="small" />
                    )}
                    inputFormat="dd/MM/yyyy"
                    minDate={validityStartDate}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          )}
        </Box>
      )}

      {documents.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" color="primary.main" gutterBottom>
            Uploaded Documents
          </Typography>

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead sx={{ bgcolor: "background.default" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Document Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    Validity Period
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <FileIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "primary.main" }}
                        />
                        <Typography variant="body2">{doc.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={doc.categoryName || doc.category || "N/A"}
                        size="small"
                        color="primary"
                        sx={{
                          bgcolor: "primary.light",
                          color: "white",
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {doc.size ? formatFileSize(doc.size) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {doc.type ? doc.type.split("/")[1].toUpperCase() : "N/A"}
                    </TableCell>
                    <TableCell>
                      {doc.hasValidity
                        ? formatDateRange(
                            doc.validityStartDate,
                            doc.validityEndDate
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveDocument(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default DocumentUpload;
