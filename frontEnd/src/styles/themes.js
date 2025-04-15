import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0EA5E9", // Bright Cyan (Primary)
      light: "#38BDF8", // Lighter shade of primary
      dark: "#0284C7", // Darker shade of primary
    },
    secondary: {
      main: "#14B8A6", // Fresh Teal (Secondary)
      light: "#2DD4BF", // Lighter shade of secondary
      dark: "#0F766E", // Darker shade of secondary
    },
    error: {
      main: "#E11D48", // Soft Red (Accent)
    },
    background: {
      default: "#F1F5F9", // Cool Light Gray (Background)
      paper: "#FFFFFF", // White
      hover: "#E2E8F0", // Light gray hover
      active: "#CBD5E1", // Dark gray active state
    },
    text: {
      primary: "#334155", // Slate 700 - Dark gray text
      secondary: "#64748B", // Slate 500 - Medium gray text
    },
  },
  typography: {
    fontFamily: `"Lato", "Helvetica", "Arial", sans-serif`,
    fontSize: 14,
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.75rem",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
    },
    button: {
      textTransform: "none", // Remove button text capitalization
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8, // Slightly rounded corners
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#FFFFFF", // Sidebar background
          color: "#334155",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          },
        },
        contained: {
          "&:hover": {
            backgroundColor: "#38BDF8", // Lighter primary
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#CBD5E1", // Default border color
            },
            "&:hover fieldset": {
              borderColor: "#0EA5E9", // Primary color
            },
            "&.Mui-focused fieldset": {
              borderColor: "#0EA5E9", // Primary color
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
          borderRadius: "12px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
        },
        elevation1: {
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#F1F5F9", // Background color
          "& .MuiTableCell-head": {
            fontWeight: 600,
            color: "#334155", // Text primary
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:nth-of-type(even)": {
            backgroundColor: "#F8FAFC", // Very light gray
          },
          "&:hover": {
            backgroundColor: "#E2E8F0", // Light hover color
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          backgroundColor: "#F8FAFC", // Very light gray
        },
      },
    },
  },
});

export default theme;
