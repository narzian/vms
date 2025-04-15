import React from "react";
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText, 
  Box, 
  Typography,
  Chip
} from "@mui/material";

const SelectField = ({ 
  id, 
  name, 
  label, 
  value, 
  onChange, 
  options = [], 
  error,
  required,
  disabled,
  multiple,
  placeholder,
  renderValue,
  size = "medium",
  sx,
  optionLabelKey,
  optionValueKey
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
    <FormControl 
      fullWidth 
      error={!!error} 
      variant="outlined"
      disabled={disabled}
      size={size}
    >
      <Select
        id={id}
        name={name || id}
        value={value || (multiple ? [] : '')}
        onChange={onChange}
        multiple={multiple}
        displayEmpty
        renderValue={renderValue || (multiple && value?.length > 0 
          ? (selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip 
                    key={optionValueKey ? value[optionValueKey] : value} 
                    label={optionLabelKey ? value[optionLabelKey] : value} 
                    size="small"
                    sx={{ 
                      backgroundColor: 'primary.light',
                      color: 'white',
                      fontWeight: 500
                    }}
                  />
                ))}
              </Box>
            )
          : undefined
        )}
        sx={{ 
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: error ? 'error.main' : 'rgba(203, 213, 225, 0.8)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
          },
          backgroundColor: disabled ? 'rgba(0, 0, 0, 0.04)' : 'white',
          borderRadius: '8px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 0 0 2px rgba(14, 165, 233, 0.2)'
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 2px rgba(14, 165, 233, 0.3)'
          },
          ...sx
        }}
      >
        <MenuItem value="" disabled={required}>
          <em>{placeholder || `Select ${label}`}</em>
        </MenuItem>
        {options.map((option, index) => (
          <MenuItem 
            key={index} 
            value={optionValueKey ? option[optionValueKey] : option}
          >
            {optionLabelKey ? option[optionLabelKey] : option}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  </Box>
);

export default SelectField;