import React, { useState } from "react";
import axios from "../../utils/axios";
import { vendorFormFields } from "../reusable/formConfig";
import InputField from "../reusable/InputField";
import SelectField from "../reusable/SelectField";
import RadioField from "../reusable/RadioField";
import ButtonField from "../reusable/ButtonField";
import CardContainer from "../reusable/CardContainer";
import useForm from "../reusable/useForm";
import { validate } from "../reusable/validation";
import {
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  Box,
  Grid,
  Divider,
  Alert,
  Snackbar,
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
  CloudUpload as CloudUploadIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import DocumentUpload from "../reusable/documentUpload";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateVendorForm = () => {
  const initialFormState = vendorFormFields.reduce(
    (acc, field) => ({ ...acc, [field.id]: "" }),
    { comments: "", landmark: "" }
  );
  const { formData, errors, handleChange, setFormData, resetForm } = useForm(
    initialFormState,
    validate
  );
  const [documents, setDocuments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const countryStateMap = {
    India: ["Delhi", "Maharashtra", "Karnataka"],
    USA: ["California", "Texas", "New York"],
    Canada: ["Ontario", "Quebec", "Alberta"],
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleCountryChange = (event) => {
    const selectedCountry = event.target.value;
    setFormData((prevData) => ({
      ...prevData,
      country: selectedCountry,
      state: "",
      city: "",
    }));
    setStates(countryStateMap[selectedCountry] || []);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();

    // Add all form fields
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    // Add document files
    documents.forEach((doc, index) => {
      formDataToSend.append("documents", doc.file);
    });

    // Add document metadata as comma-separated values
    // For document categories
    const documentCategories = documents.map((doc) => doc.category).join(",");
    formDataToSend.append("document_categories", documentCategories);

    // For validity flags
    const validityFlags = documents
      .map((doc) => doc.validityFlag || false)
      .join(",");
    formDataToSend.append("validity_flags", validityFlags);

    // For validity dates
    const startDates = documents
      .map((doc) => doc.validityStartDate || "")
      .join(",");
    formDataToSend.append("validity_start_dates", startDates);

    const endDates = documents
      .map((doc) => doc.validityEndDate || "")
      .join(",");
    formDataToSend.append("validity_end_dates", endDates);

    try {
      console.log("Sending data to server...");
      // Use the absolute URL to ensure correct endpoint
      const response = await axios.post("/api/vendors", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Server response:", response.data);
      resetForm();
      setDocuments([]);
      handleDialogOpen();
      setSnackbar({
        open: true,
        message: "Vendor created successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error:", error);
      setSnackbar({
        open: true,
        message:
          "Failed to create vendor: " +
          (error.response?.data?.message || error.message),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 2 }}>
      <CardContainer
        title="Create New Vendor"
        icon={<BusinessIcon fontSize="medium" />}
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
            <Tab label="Vendor Details" />
            <Tab label="Contact Info" />
            <Tab label="Address" />
            <Tab label="Status & Documents" />
          </Tabs>

          {/* Tab 1: Vendor Details */}
          {tabValue === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <InputField
                  id="vendor_name"
                  label="Vendor Name"
                  type="text"
                  value={formData.vendor_name}
                  onChange={handleChange}
                  error={errors.vendor_name}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <SelectField
                  id="vendor_type"
                  label="Vendor Type"
                  value={formData.vendor_type}
                  onChange={handleChange}
                  options={[
                    "Service Provider",
                    "Product Supplier",
                    "Consultant",
                    "Contractor",
                  ]}
                  error={errors.vendor_type}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <SelectField
                  id="vendor_tier"
                  label="Vendor Tier"
                  value={formData.vendor_tier}
                  onChange={handleChange}
                  options={["Tier 1", "Tier 2", "Tier 3"]}
                  error={errors.vendor_tier}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <InputField
                  id="pan"
                  label="PAN Number"
                  type="text"
                  value={formData.pan}
                  onChange={handleChange}
                  error={errors.pan}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <InputField
                  id="gstin"
                  label="GSTIN"
                  type="text"
                  value={formData.gstin}
                  onChange={handleChange}
                  error={errors.gstin}
                  size="small"
                />
              </Grid>
            </Grid>
          )}

          {/* Tab 2: Contact Information */}
          {tabValue === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <InputField
                  id="primary_contact_name"
                  label="Contact Person Name"
                  type="text"
                  value={formData.primary_contact_name}
                  onChange={handleChange}
                  error={errors.primary_contact_name}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <InputField
                  id="primary_contact_phone"
                  label="Contact Phone Number"
                  type="tel"
                  value={formData.primary_contact_phone}
                  onChange={handleChange}
                  error={errors.primary_contact_phone}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <InputField
                  id="primary_contact_email"
                  label="Contact Email"
                  type="email"
                  value={formData.primary_contact_email}
                  onChange={handleChange}
                  error={errors.primary_contact_email}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <InputField
                  id="vendor_email"
                  label="Company Email"
                  type="email"
                  value={formData.vendor_email}
                  onChange={handleChange}
                  error={errors.vendor_email}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <InputField
                  id="vendor_phone"
                  label="Company Phone"
                  type="tel"
                  value={formData.vendor_phone}
                  onChange={handleChange}
                  error={errors.vendor_phone}
                  required
                  size="small"
                />
              </Grid>
            </Grid>
          )}

          {/* Tab 3: Address Information */}
          {tabValue === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <SelectField
                  id="country"
                  label="Country"
                  value={formData.country}
                  onChange={handleCountryChange}
                  options={Object.keys(countryStateMap)}
                  error={errors.country}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <SelectField
                  id="state"
                  label="State/Province"
                  value={formData.state}
                  onChange={handleChange}
                  options={states}
                  error={errors.state}
                  disabled={!formData.country}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <InputField
                  id="city"
                  label="City"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  error={errors.city}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <InputField
                  id="address_line_1"
                  label="Address Line 1"
                  type="text"
                  value={formData.address_line_1}
                  onChange={handleChange}
                  error={errors.address_line_1}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <InputField
                  id="address_line_2"
                  label="Address Line 2"
                  type="text"
                  value={formData.address_line_2}
                  onChange={handleChange}
                  error={errors.address_line_2}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <InputField
                  id="landmark"
                  label="Landmark"
                  type="text"
                  value={formData.landmark}
                  onChange={handleChange}
                  error={errors.landmark}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <InputField
                  id="zip_code"
                  label="Zip/Postal Code"
                  type="text"
                  value={formData.zip_code}
                  onChange={handleChange}
                  error={errors.zip_code}
                  required
                  size="small"
                />
              </Grid>
            </Grid>
          )}

          {/* Tab 4: Status & Documents */}
          {tabValue === 3 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={6}>
                <RadioField
                  id="vendor_status"
                  label="Vendor Status"
                  value={formData.vendor_status}
                  onChange={handleChange}
                  options={["Active", "Inactive", "Pending"]}
                  error={errors.vendor_status}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <InputField
                  id="comments"
                  label="Comments"
                  type="textarea"
                  multiline
                  rows={3}
                  value={formData.comments}
                  onChange={handleChange}
                  error={errors.comments}
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
                      formType="Vendor"
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

              {tabValue < 3 ? (
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
                  Create Vendor
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
          {"Vendor Created Successfully"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            The vendor has been successfully created in the system.
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

export default CreateVendorForm;
