import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import InputField from "../reusable/InputField";
import SelectField from "../reusable/SelectField";
import RadioField from "../reusable/RadioField";
import ButtonField from "../reusable/ButtonField";
import CardContainer from "../reusable/CardContainer";
import useForm from "../reusable/useForm";
import { currencyRates } from "../reusable/currencyConfig";
import DocumentUpload from "../reusable/documentUpload";
import { validate } from "../reusable/validation";
import {
  Grid,
  Typography,
  Box,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Slide,
  InputAdornment,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const expenseFormFields = [
  { id: "expense_description", label: "Expense Description", type: "textarea" },
  { id: "expense_reference_type", label: "Reference Type", type: "select" },
  { id: "expense_reference_number", label: "Reference Number", type: "text" },
  { id: "expense_start_date", label: "Start Date", type: "date" },
  { id: "expense_end_date", label: "End Date", type: "date" },
  { id: "expense_tenure", label: "Expense Tenure", type: "text" },
  { id: "expense_amount", label: "Expense Amount", type: "number" },
];

const initialState = expenseFormFields.reduce(
  (acc, field) => ({ ...acc, [field.id]: "" }),
  {}
);

const currencyOptions = [
  { value: "INR", label: "₹ (INR)", symbol: "₹" },
  { value: "USD", label: "$ (USD)", symbol: "$" },
  { value: "EUR", label: "€ (EUR)", symbol: "€" },
  { value: "GBP", label: "£ (GBP)", symbol: "£" },
  { value: "JPY", label: "¥ (JPY)", symbol: "¥" },
];

// TabPanel component for the tabbed interface
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`expense-tabpanel-${index}`}
      aria-labelledby={`expense-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const CreateExpenseForm = () => {
  const { formData, errors, handleChange, setFormData, setErrors, resetForm } =
    useForm(initialState, validate);
  const [engagements, setEngagements] = useState([]);
  const [selectedEngagement, setSelectedEngagement] = useState(null);
  const [currency, setCurrency] = useState("INR");
  const [convertedAmount, setConvertedAmount] = useState("");
  const [conversionRate, setConversionRate] = useState(1);
  const [amount, setAmount] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  // State for tabbed interface
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const fetchEngagements = async () => {
      setLoading(true);
      try {
        const response = await axios.get("engagements/active");
        setEngagements(response.data || []);
      } catch (error) {
        console.error("Error fetching engagements:", error);
        setSnackbar({
          open: true,
          message:
            "Failed to fetch engagements: " +
            (error.response?.data?.message || error.message),
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEngagements();
  }, []);

  const handleEngagementChange = (event) => {
    const engagementId = event.target.value;
    const engagement = engagements.find(
      (eng) => eng.engagement_id === engagementId
    );
    if (engagement) {
      setSelectedEngagement(engagement);
      setFormData({
        ...formData,
        engagement_id: engagementId,
        vendor_id: engagement.vendor_id,
        department_id: engagement.department_id,
      });
    }
  };

  const handleCurrencyChange = (event) => {
    const selectedCurrency = event.target.value;
    setCurrency(selectedCurrency);
    const rate = currencyRates[selectedCurrency] || 1;
    setConversionRate(rate);
    if (amount) {
      if (selectedCurrency === "INR") {
        setConvertedAmount("");
      } else {
        const amountValue = parseFloat(amount);
        if (!isNaN(amountValue)) {
          const convertedToINR = amountValue * rate;
          setConvertedAmount(convertedToINR.toFixed(2));
          setFormData({
            ...formData,
            expense_amount: convertedToINR.toFixed(2),
          });
        }
      }
    }
  };

  const handleAmountChange = (event) => {
    const inputAmount = event.target.value;
    setAmount(inputAmount);
    if (inputAmount === "") {
      setConvertedAmount("");
      setFormData({
        ...formData,
        expense_amount: "",
      });
      return;
    }
    const amountValue = parseFloat(inputAmount);
    if (!isNaN(amountValue)) {
      if (currency === "INR") {
        setFormData({
          ...formData,
          expense_amount: amountValue.toFixed(2),
        });
        setConvertedAmount("");
      } else {
        const convertedToINR = amountValue * conversionRate;
        setConvertedAmount(convertedToINR.toFixed(2));
        setFormData({
          ...formData,
          expense_amount: convertedToINR.toFixed(2),
        });
      }
    }
  };

  const handleReset = () => {
    resetForm();
    setDocuments([]);
    setAmount("");
    setConvertedAmount("");
    setSelectedEngagement(null);
    setActiveTab(0);
    setSnackbar({
      open: true,
      message: "Form has been reset",
      severity: "info",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.engagement_id) {
      setErrors((prev) => ({
        ...prev,
        engagement_id: "Please select an engagement",
      }));
      setActiveTab(0);
      return;
    }
    setLoading(true);
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });
    formDataToSend.append("currency", currency);
    formDataToSend.append("conversion_rate", conversionRate);
    documents.forEach((doc) => {
      formDataToSend.append("documents", doc.file);
    });

    try {
      await axios.post("expenses", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      resetForm();
      setDocuments([]);
      setAmount("");
      setConvertedAmount("");
      setSelectedEngagement(null);
      setActiveTab(0);
      handleDialogOpen();
      setSnackbar({
        open: true,
        message: "Expense created successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error:", error);
      setSnackbar({
        open: true,
        message:
          "Failed to create expense: " +
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
        title="Create New Expense"
        icon={<ReceiptIcon fontSize="medium" />}
        elevation={2}
      >
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Fixed height container to maintain consistent size */}
          <Box sx={{ minHeight: "400px" }}>
            {/* Left-aligned tabs with no stretch */}
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="standard"
                sx={{ minHeight: 48 }}
              >
                <Tab label="Basic Info" sx={{ minHeight: 48 }} />
                <Tab label="Amount" sx={{ minHeight: 48 }} />
                <Tab label="Timeline" sx={{ minHeight: 48 }} />
                <Tab label="Documents" sx={{ minHeight: 48 }} />
              </Tabs>
            </Box>

            {/* Tab 1: Basic Information */}
            <TabPanel value={activeTab} index={0}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <SelectField
                    id="engagement_id"
                    label="Engagement"
                    value={formData.engagement_id || ""}
                    onChange={handleEngagementChange}
                    options={engagements}
                    optionLabelKey="engagement_name"
                    optionValueKey="engagement_id"
                    error={errors.engagement_id}
                    required
                    disabled={loading}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InputField
                    id="expense_description"
                    label="Expense Description"
                    type="text"
                    value={formData.expense_description || ""}
                    onChange={handleChange}
                    error={errors.expense_description}
                    required
                    multiline
                    rows={1}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectField
                    id="expense_reference_type"
                    label="Reference Type"
                    value={formData.expense_reference_type || ""}
                    onChange={handleChange}
                    options={["Invoice", "Receipt", "Contract", "Other"]}
                    error={errors.expense_reference_type}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InputField
                    id="expense_reference_number"
                    label="Reference Number"
                    type="text"
                    value={formData.expense_reference_number || ""}
                    onChange={handleChange}
                    error={errors.expense_reference_number}
                    required
                    fullWidth
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tab 2: Amount Details */}
            <TabPanel value={activeTab} index={1}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                  >
                    <FormControl fullWidth variant="outlined">
                      <Box sx={{ display: "flex", mb: 1 }}>
                        <FormControl
                          variant="outlined"
                          sx={{ width: "30%", mr: 1 }}
                        >
                          <InputLabel id="currency-select-label">
                            Currency
                          </InputLabel>
                          <Select
                            labelId="currency-select-label"
                            id="currency-select"
                            value={currency}
                            onChange={handleCurrencyChange}
                            label="Currency"
                            size="small"
                          >
                            {currencyOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          id="expense_amount_input"
                          label="Amount"
                          type="number"
                          value={amount}
                          onChange={handleAmountChange}
                          variant="outlined"
                          fullWidth
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                {currencyOptions.find(
                                  (opt) => opt.value === currency
                                )?.symbol || "₹"}
                              </InputAdornment>
                            ),
                          }}
                          error={!!errors.expense_amount}
                          helperText={errors.expense_amount}
                        />
                      </Box>
                      {currency !== "INR" && (
                        <>
                          <TextField
                            id="converted_amount"
                            label="Converted to INR"
                            value={convertedAmount}
                            variant="outlined"
                            fullWidth
                            size="small"
                            disabled
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),
                            }}
                            sx={{ mt: 2 }}
                          />
                          <FormHelperText>
                            Current rate: 1 {currency} ={" "}
                            {currencyRates[currency]} INR
                          </FormHelperText>
                        </>
                      )}
                    </FormControl>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tab 3: Timeline */}
            <TabPanel value={activeTab} index={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InputField
                    id="expense_start_date"
                    label="Start Date"
                    type="date"
                    value={formData.expense_start_date || ""}
                    onChange={handleChange}
                    error={errors.expense_start_date}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InputField
                    id="expense_end_date"
                    label="End Date"
                    type="date"
                    value={formData.expense_end_date || ""}
                    onChange={handleChange}
                    error={errors.expense_end_date}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <RadioField
                    id="expense_status"
                    label="Expense Status"
                    value={formData.expense_status || ""}
                    onChange={handleChange}
                    options={["Pending", "Approved", "Rejected"]}
                    error={errors.expense_status}
                    required
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tab 4: Document Upload */}
            <TabPanel value={activeTab} index={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <DocumentUpload
                    documents={documents}
                    setDocuments={setDocuments}
                    formType="Expense"
                  />
                </Grid>
              </Grid>
            </TabPanel>
          </Box>

          {/* Form buttons - visible on all tabs */}
          <Divider sx={{ mt: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
            <ButtonField
              variant="text"
              color="primary"
              onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
              disabled={activeTab === 0}
            >
              Previous
            </ButtonField>

            <Box sx={{ display: "flex" }}>
              <ButtonField
                variant="outlined"
                color="secondary"
                onClick={handleReset}
                startIcon={<ClearIcon />}
                sx={{ mr: 1 }}
              >
                Reset
              </ButtonField>

              {activeTab === 3 ? (
                <ButtonField
                  type="submit"
                  variant="contained"
                  color="primary"
                  loading={loading}
                  startIcon={<SaveIcon />}
                >
                  Create Expense
                </ButtonField>
              ) : (
                <ButtonField
                  variant="contained"
                  color="primary"
                  onClick={() => setActiveTab(Math.min(3, activeTab + 1))}
                >
                  Next
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
          {"Expense Created Successfully"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            The expense has been successfully created in the system.
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

export default CreateExpenseForm;
