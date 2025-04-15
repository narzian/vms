import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Chip,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

const steps = ['Basic Information', 'Conditions', 'Approvers', 'Notifications', 'Review'];

const CreateWorkflow = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [workflowData, setWorkflowData] = useState({
    name: '',
    description: '',
    formType: '',
    triggers: {
      onCreate: false,
      onUpdate: false,
      onDelete: false,
    },
    conditions: [],
    approvers: [],
    notifications: {
      notifyCreator: true,
      notifyApprovers: true,
      reminderInterval: 24, // hours
    }
  });
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWorkflowData({
      ...workflowData,
      [name]: value
    });
  };

  const handleTriggerChange = (e) => {
    const { name, checked } = e.target;
    setWorkflowData({
      ...workflowData,
      triggers: {
        ...workflowData.triggers,
        [name]: checked
      }
    });
  };

  const handleNotificationChange = (e) => {
    const { name, checked, value, type } = e.target;
    setWorkflowData({
      ...workflowData,
      notifications: {
        ...workflowData.notifications,
        [name]: type === 'checkbox' ? checked : value
      }
    });
  };

  const addCondition = () => {
    setWorkflowData({
      ...workflowData,
      conditions: [
        ...workflowData.conditions,
        { field: '', operator: '', value: '' }
      ]
    });
  };

  const removeCondition = (index) => {
    const updatedConditions = [...workflowData.conditions];
    updatedConditions.splice(index, 1);
    setWorkflowData({
      ...workflowData,
      conditions: updatedConditions
    });
  };

  const handleConditionChange = (index, field, value) => {
    const updatedConditions = [...workflowData.conditions];
    updatedConditions[index][field] = value;
    setWorkflowData({
      ...workflowData,
      conditions: updatedConditions
    });
  };

  const addApprover = () => {
    setWorkflowData({
      ...workflowData,
      approvers: [
        ...workflowData.approvers,
        { userId: '', role: '', level: workflowData.approvers.length + 1 }
      ]
    });
  };

  const removeApprover = (index) => {
    const updatedApprovers = [...workflowData.approvers];
    updatedApprovers.splice(index, 1);
    // Re-index the levels
    const reindexedApprovers = updatedApprovers.map((approver, idx) => ({
      ...approver,
      level: idx + 1
    }));
    setWorkflowData({
      ...workflowData,
      approvers: reindexedApprovers
    });
  };

  const handleApproverChange = (index, field, value) => {
    const updatedApprovers = [...workflowData.approvers];
    updatedApprovers[index][field] = value;
    setWorkflowData({
      ...workflowData,
      approvers: updatedApprovers
    });
  };

  const handleSubmit = () => {
    // In a real application, you would submit to your API here
    console.log('Submitting workflow:', workflowData);
    alert('Workflow created successfully!');
    navigate('/workflows/manage');
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Workflow Details
            </Typography>
            <TextField
              required
              fullWidth
              margin="normal"
              label="Workflow Name"
              name="name"
              value={workflowData.name}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              name="description"
              multiline
              rows={3}
              value={workflowData.description}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Form Type</InputLabel>
              <Select
                name="formType"
                value={workflowData.formType}
                label="Form Type"
                onChange={handleInputChange}
              >
                <MenuItem value="vendor">Vendor Form</MenuItem>
                <MenuItem value="engagement">Engagement Form</MenuItem>
                <MenuItem value="expense">Expense Form</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="h6" sx={{ mt: 3 }}>
              Workflow Triggers
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={workflowData.triggers.onCreate}
                    onChange={handleTriggerChange}
                    name="onCreate"
                  />
                }
                label="Trigger on Create"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={workflowData.triggers.onUpdate}
                    onChange={handleTriggerChange}
                    name="onUpdate"
                  />
                }
                label="Trigger on Update"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={workflowData.triggers.onDelete}
                    onChange={handleTriggerChange}
                    name="onDelete"
                  />
                }
                label="Trigger on Delete"
              />
            </FormGroup>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Workflow Conditions
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                onClick={addCondition}
              >
                Add Condition
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Define the conditions that will trigger this workflow. If left empty, the workflow will apply to all records.
            </Typography>
            
            {workflowData.conditions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="body1" color="text.secondary">
                  No conditions added yet. Click "Add Condition" to define when this workflow should be triggered.
                </Typography>
              </Box>
            ) : (
              workflowData.conditions.map((condition, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1">Condition {index + 1}</Typography>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => removeCondition(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel>Field</InputLabel>
                        <Select
                          value={condition.field}
                          label="Field"
                          onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
                        >
                          <MenuItem value="vendorName">Vendor Name</MenuItem>
                          <MenuItem value="vendorType">Vendor Type</MenuItem>
                          <MenuItem value="contractAmount">Contract Amount</MenuItem>
                          <MenuItem value="expenseAmount">Expense Amount</MenuItem>
                          <MenuItem value="department">Department</MenuItem>
                          <MenuItem value="creator">Creator</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel>Operator</InputLabel>
                        <Select
                          value={condition.operator}
                          label="Operator"
                          onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                        >
                          <MenuItem value="equals">Equals</MenuItem>
                          <MenuItem value="notEquals">Not Equals</MenuItem>
                          <MenuItem value="contains">Contains</MenuItem>
                          <MenuItem value="greaterThan">Greater Than</MenuItem>
                          <MenuItem value="lessThan">Less Than</MenuItem>
                          <MenuItem value="in">In</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="Value"
                        value={condition.value}
                        onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Workflow Approvers
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                onClick={addApprover}
              >
                Add Approver
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Define the approval chain for this workflow. Approvers will be notified in sequence based on their level.
            </Typography>
            
            {workflowData.approvers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="body1" color="text.secondary">
                  No approvers added yet. Click "Add Approver" to build your approval chain.
                </Typography>
              </Box>
            ) : (
              workflowData.approvers.map((approver, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={`Level ${approver.level}`} color="primary" />
                        <Typography variant="subtitle1">Approver</Typography>
                      </Box>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => removeApprover(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel>Approver Type</InputLabel>
                        <Select
                          value={approver.role}
                          label="Approver Type"
                          onChange={(e) => handleApproverChange(index, 'role', e.target.value)}
                        >
                          <MenuItem value="specificUser">Specific User</MenuItem>
                          <MenuItem value="managerOfCreator">Manager of Creator</MenuItem>
                          <MenuItem value="departmentHead">Department Head</MenuItem>
                          <MenuItem value="financeTeam">Finance Team</MenuItem>
                          <MenuItem value="procurementTeam">Procurement Team</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel>User</InputLabel>
                        <Select
                          value={approver.userId}
                          label="User"
                          onChange={(e) => handleApproverChange(index, 'userId', e.target.value)}
                          disabled={approver.role !== 'specificUser'}
                        >
                          <MenuItem value="user1">John Doe</MenuItem>
                          <MenuItem value="user2">Jane Smith</MenuItem>
                          <MenuItem value="user3">Mike Johnson</MenuItem>
                          <MenuItem value="user4">Sarah Williams</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={workflowData.notifications.notifyCreator}
                    onChange={handleNotificationChange}
                    name="notifyCreator"
                  />
                }
                label="Notify form creator on workflow status changes"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={workflowData.notifications.notifyApprovers}
                    onChange={handleNotificationChange}
                    name="notifyApprovers"
                  />
                }
                label="Send email notifications to approvers"
              />
            </FormGroup>
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Reminder Interval (hours)"
                type="number"
                name="reminderInterval"
                value={workflowData.notifications.reminderInterval}
                onChange={handleNotificationChange}
                InputProps={{ inputProps: { min: 0 } }}
                helperText="Time to wait before sending reminder notifications. Set to 0 to disable reminders."
              />
            </Box>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review Workflow
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, mt: 2, mb: 4 }}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Box sx={{ mb: 3 }}>
                <Typography><strong>Name:</strong> {workflowData.name}</Typography>
                <Typography><strong>Description:</strong> {workflowData.description}</Typography>
                <Typography><strong>Form Type:</strong> {workflowData.formType === 'vendor' ? 'Vendor Form' : 
                  workflowData.formType === 'engagement' ? 'Engagement Form' : 
                  workflowData.formType === 'expense' ? 'Expense Form' : ''}</Typography>
                <Typography><strong>Triggers:</strong> {
                  [
                    workflowData.triggers.onCreate ? 'On Create' : null,
                    workflowData.triggers.onUpdate ? 'On Update' : null,
                    workflowData.triggers.onDelete ? 'On Delete' : null
                  ].filter(Boolean).join(', ') || 'None'
                }</Typography>
              </Box>

              <Divider />

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Conditions</Typography>
              {workflowData.conditions.length === 0 ? (
                <Typography color="text.secondary">No conditions (applies to all records)</Typography>
              ) : (
                workflowData.conditions.map((condition, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography>
                      {index + 1}. {condition.field} {condition.operator} {condition.value}
                    </Typography>
                  </Box>
                ))
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 1 }}>Approvers</Typography>
              {workflowData.approvers.length === 0 ? (
                <Typography color="text.secondary">No approvers defined</Typography>
              ) : (
                workflowData.approvers.map((approver, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography>
                      Level {approver.level}: {approver.role === 'specificUser' ? 
                        `User (${approver.userId})` : approver.role}
                    </Typography>
                  </Box>
                ))
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 1 }}>Notifications</Typography>
              <Typography>
                Notify creator: {workflowData.notifications.notifyCreator ? 'Yes' : 'No'}
              </Typography>
              <Typography>
                Notify approvers: {workflowData.notifications.notifyApprovers ? 'Yes' : 'No'}
              </Typography>
              <Typography>
                Reminder interval: {workflowData.notifications.reminderInterval} hours
              </Typography>
            </Paper>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <IconButton sx={{ mr: 1 }} onClick={() => navigate('/workflows/manage')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="div">
            Create New Workflow
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ width: '100%', p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {getStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              color="primary"
              startIcon={<SaveIcon />}
            >
              Create Workflow
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              color="primary"
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateWorkflow;