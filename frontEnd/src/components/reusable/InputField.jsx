import React from "react";
import { TextField, InputAdornment, Box, Typography } from "@mui/material";

const InputField = ({ 
  id, 
  name, 
  label, 
  type, 
  value, 
  onChange, 
  error, 
  multiline, 
  rows, 
  inputProps, 
  helperText,
  startAdornment,
  endAdornment,
  placeholder,
  required,
  disabled,
  size = "medium",
  sx
}) => (
  <Box sx={{ mb: 2, width: '100%' }}>
    {label && (
      <Typography 
        variant="body2" 
        sx={{ 
          mb: 0.5, 
          fontWeight: 500, 
          color: error ? 'error.main' : 'text.primary',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {label}
        {required && <Typography component="span" color="error.main" ml={0.5}>*</Typography>}
      </Typography>
    )}
    <TextField
      id={id}
      name={name || id}
      type={type}
      value={value || ""}
      onChange={onChange}
      error={!!error}
      helperText={error || helperText}
      fullWidth
      variant="outlined"
      multiline={multiline}
      rows={rows}
      placeholder={placeholder}
      disabled={disabled}
      size={size}
      InputProps={{
        startAdornment: startAdornment ? (
          <InputAdornment position="start">{startAdornment}</InputAdornment>
        ) : null,
        endAdornment: endAdornment ? (
          <InputAdornment position="end">{endAdornment}</InputAdornment>
        ) : null,
        ...inputProps
      }}
      sx={{ 
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          backgroundColor: disabled ? 'rgba(0, 0, 0, 0.04)' : 'white',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 0 0 2px rgba(14, 165, 233, 0.2)'
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 2px rgba(14, 165, 233, 0.3)'
          }
        },
        ...sx
      }}
    />
  </Box>
);

export default InputField;