import React from "react";
import { 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  FormHelperText,
  Box,
  Typography
} from "@mui/material";

const RadioField = ({ 
  id, 
  name, 
  label, 
  value, 
  onChange, 
  options = [], 
  error,
  required,
  disabled,
  row = true,
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
      component="fieldset" 
      error={!!error} 
      disabled={disabled}
      sx={{ width: '100%', ...sx }}
    >
      <RadioGroup
        id={id}
        name={name || id}
        value={value || ""}
        onChange={onChange}
        row={row}
      >
        {options.map((option, index) => (
          <FormControlLabel
            key={index}
            value={optionValueKey ? option[optionValueKey] : option}
            control={
              <Radio 
                size={size}
                sx={{
                  color: 'primary.main',
                  '&.Mui-checked': {
                    color: 'primary.main',
                  },
                }}
              />
            }
            label={
              <Typography variant="body2" color="text.primary">
                {optionLabelKey ? option[optionLabelKey] : option}
              </Typography>
            }
            sx={{
              marginRight: 3,
              '& .MuiFormControlLabel-label': {
                fontSize: '0.875rem',
              }
            }}
          />
        ))}
      </RadioGroup>
      {error && (
        <FormHelperText error sx={{ mt: 0.5 }}>
          {error}
        </FormHelperText>
      )}
    </FormControl>
  </Box>
);

export default RadioField;
