import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import { engagementFormFields } from "../reusable/formConfig";
import InputField from "../reusable/InputField";
import RadioField from "../reusable/RadioField";
import SelectField from "../reusable/SelectField";
import ButtonField from "../reusable/ButtonField";
import CardContainer from "../reusable/CardContainer";
import useForm from "../reusable/useForm";
import { validate } from "../reusable/validation";
import {
  Typography,
  Autocomplete,
  TextField,
  Grid,
  Box,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  Chip,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Business as BusinessIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import DocumentUpload from "../reusable/documentUpload";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const initialFormData = engagementFormFields.reduce(
  (acc, field) => ({ ...acc, [field.id]: "" }),
  {}
);

const CreateEngagement = () => {
  const { formData, errors, handleChange, setFormData, setErrors, resetForm } =
    useForm(initialFormData, validate);
  const [documents, setDocuments] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [duration, setDuration] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        const response = await axios.get("vendors/active");
        setVendors(response.data || []);
      } catch (error) {
        console.error("Error fetching active vendors:", error);
        setSnackbar({
          open: true,
          message:
            "Failed to fetch vendors: " +
            (error.response?.data?.message || error.message),
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await axios.get("departments");
        setDepartments(response.data || []);
      } catch (error) {
        console.error("Error fetching departments:", error);
        setSnackbar({
          open: true,
          message:
            "Failed to fetch departments: " +
            (error.response?.data?.message || error.message),
          severity: "error",
        });
      }
    };

    fetchVendors();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);

      if (end >= start) {
        const diffTime = Math.abs(end - start);

        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let years = 0;
        let months = 0;
        let days = diffDays;

        if (days >= 365) {
          years = Math.floor(days / 365);
          days = days % 365;
        }

        if (days >= 30) {
          months = Math.floor(days / 30);
          days = days % 30;
        }

        let durationText = "";
        if (years > 0) {
          durationText += `${years} year${years > 1 ? "s" : ""} `;
        }
        if (months > 0) {
          durationText += `${months} month${months > 1 ? "s" : ""} `;
        }
        if (days > 0 || (years === 0 && months === 0)) {
          durationText += `${days} day${days !== 1 ? "s" : ""}`;
        }

        setDuration(durationText.trim());
      } else {
        setDuration("End date must be after start date");
      }
    } else {
      setDuration(null);
    }
  }, [formData.start_date, formData.end_date]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleVendorChange = (event) => {
    const vendorId = event.target.value;
    setFormData((prevData) => ({
      ...prevData,
      engaged_vendor_id: vendorId,
    }));
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleReset = () => {
    resetForm();
    setDocuments([]);
    setSnackbar({
      open: true,
      message: "Form has been reset",
      severity: "info",
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.engaged_vendor_id) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        engaged_vendor_id: "Please select an active vendor.",
      }));
      return;
    }

    setLoading(true);
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });
    documents.forEach((doc) => {
      formDataToSend.append("documents", doc.file);
    });

    try {
      await axios.post("engagements", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      resetForm();
      setDocuments([]);
      handleDialogOpen();
      setSnackbar({
        open: true,
        message: "Engagement created successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error:", error);
      setSnackbar({
        open: true,
        message:
          "Failed to create engagement: " +
          (error.response?.data?.message || error.message),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <CardContainer
        title="Create New Engagement"
        icon={<AssignmentIcon fontSize="medium" />}
        elevation={2}
      >
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Basic Info" />
            <Tab label="Timeline" />
            <Tab label="Contact & Documents" />
          </Tabs>

          {/* Tab 1: Basic Information */}
          {tabValue === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={6}>
                <SelectField
                  id="engaged_vendor_id"
                  label="Engaged Vendor"
                  value={formData.engaged_vendor_id}
                  onChange={handleVendorChange}
                  options={vendors}
                  optionLabelKey="vendor_name"
                  optionValueKey="vendor_id"
                  error={errors.engaged_vendor_id}
                  required
                  disabled={loading}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <InputField
                  id="engagement_name"
                  label="Engagement Name"
                  type="text"
                  value={formData.engagement_name}
                  onChange={handleChange}
                  error={errors.engagement_name}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <InputField
                  id="engagement_type"
                  label="Engagement Type"
                  type="text"
                  value={formData.engagement_type}
                  onChange={handleChange}
                  error={errors.engagement_type}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <SelectField
                  id="engaged_department"
                  label="Engaged Department"
                  value={formData.engaged_department}
                  onChange={handleChange}
                  options={departments.map((dept) => dept.department_name)}
                  error={errors.engaged_department}
                  required
                  size="small"
                />
              </Grid>
            </Grid>
          )}

          {/* Tab 2: Timeline */}
          {tabValue === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InputField
                  id="start_date"
                  label="Start Date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  error={errors.start_date}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <InputField
                  id="end_date"
                  label="End Date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange}
                  error={errors.end_date}
                  required
                  size="small"
                />
              </Grid>

              {duration && (
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <CalendarIcon
                      fontSize="small"
                      sx={{ color: "text.secondary", mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Duration:{" "}
                      <Chip
                        label={duration}
                        size="small"
                        color={
                          duration.includes("must be") ? "error" : "primary"
                        }
                      />
                    </Typography>
                  </Box>
                </Grid>
              )}

              <Grid item xs={12}>
                <RadioField
                  id="engagement_status"
                  label="Engagement Status"
                  value={formData.engagement_status}
                  onChange={handleChange}
                  options={["Active", "Inactive", "Pending"]}
                  error={errors.engagement_status}
                  required
                  size="small"
                />
              </Grid>
            </Grid>
          )}

          {/* Tab 3: Contact Information & Documents */}
          {tabValue === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <InputField
                  id="contact_name"
                  label="Contact Name"
                  type="text"
                  value={formData.contact_name}
                  onChange={handleChange}
                  error={errors.contact_name}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <InputField
                  id="contact_email"
                  label="Contact Email"
                  type="email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  error={errors.contact_email}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <InputField
                  id="contact_phone"
                  label="Contact Phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  error={errors.contact_phone}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="document-upload-content"
                    id="document-upload-header"
                  >
                    <Typography color="primary">Document Upload</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <DocumentUpload
                      documents={documents}
                      setDocuments={setDocuments}
                      formType="Engagement"
                    />
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Box>
              {tabValue > 0 && (
                <ButtonField
                  variant="text"
                  color="primary"
                  onClick={() => setTabValue(tabValue - 1)}
                  size="small"
                >
                  Previous
                </ButtonField>
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <ButtonField
                variant="outlined"
                color="secondary"
                onClick={handleReset}
                startIcon={<ClearIcon />}
                size="small"
              >
                Reset
              </ButtonField>

              {tabValue < 2 ? (
                <ButtonField
                  variant="contained"
                  color="primary"
                  onClick={() => setTabValue(tabValue + 1)}
                  size="small"
                >
                  Next
                </ButtonField>
              ) : (
                <ButtonField
                  type="submit"
                  variant="contained"
                  color="primary"
                  loading={loading}
                  startIcon={<SaveIcon />}
                  size="small"
                >
                  Create Engagement
                </ButtonField>
              )}
            </Box>
          </Box>
        </form>
      </CardContainer>

      <Dialog
        open={openDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleDialogClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle sx={{ color: "primary.main", fontWeight: 600 }}>
          {"Engagement Created Successfully"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            The engagement has been successfully created in the system.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <ButtonField onClick={handleDialogClose} color="primary">
            Close
          </ButtonField>
        </DialogActions>
      </Dialog>

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

export default CreateEngagement;
