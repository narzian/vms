import React from "react";
import { Button, CircularProgress, Box } from "@mui/material";

const ButtonField = ({
  id,
  type = "button",
  variant = "contained",
  color = "primary",
  size = "medium",
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  children,
  startIcon,
  endIcon,
  sx,
  ...props
}) => (
  <Box sx={{ mt: 1, mb: 2 }}>
    <Button
      id={id}
      type={type}
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={loading ? null : startIcon}
      endIcon={loading ? null : endIcon}
      sx={{
        position: 'relative',
        fontWeight: 500,
        borderRadius: '8px',
        textTransform: 'none',
        padding: size === 'small' ? '6px 16px' : size === 'large' ? '10px 22px' : '8px 20px',
        boxShadow: variant === 'contained' ? '0px 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
        '&:hover': {
          boxShadow: variant === 'contained' ? '0px 4px 8px rgba(0, 0, 0, 0.15)' : 'none',
          backgroundColor: 
            variant === 'contained' && color === 'primary' ? 'primary.light' :
            variant === 'contained' && color === 'secondary' ? 'secondary.light' :
            variant === 'contained' && color === 'error' ? 'error.light' : undefined,
        },
        ...sx
      }}
      {...props}
    >
      {loading && (
        <CircularProgress
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
          color="inherit"
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginLeft: '-12px',
            marginTop: '-12px',
          }}
        />
      )}
      <span style={{ visibility: loading ? 'hidden' : 'visible' }}>
        {children}
      </span>
    </Button>
  </Box>
);

export default ButtonField; 