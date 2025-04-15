import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  Typography,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import InputField from "../reusable/InputField";
import SelectField from "../reusable/SelectField";
import { validate } from "../reusable/validation";


const roles = ["admin", "user"];

const CreateUser = () => {
  const [user_name, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user_role, setUserRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const passwordCriteria = [
    {
      id: "uppercase",
      text: "At least one uppercase letter (A-Z)",
      isValid: false,
    },
    {
      id: "lowercase",
      text: "At least one lowercase letter (a-z)",
      isValid: false,
    },
    { id: "number", text: "At least one number (0-9)", isValid: false },
    {
      id: "special",
      text: "At least one special character (!@#$%^&*)",
      isValid: false,
    },
    { id: "length", text: "Minimum 6 characters", isValid: false },
  ];

  const [validationRules, setValidationRules] = useState(passwordCriteria);

  const validatePassword = (inputPassword) => {
    const updatedRules = passwordCriteria.map((rule) => {
      switch (rule.id) {
        case "uppercase":
          return { ...rule, isValid: /[A-Z]/.test(inputPassword) };
        case "lowercase":
          return { ...rule, isValid: /[a-z]/.test(inputPassword) };
        case "number":
          return { ...rule, isValid: /\d/.test(inputPassword) };
        case "special":
          return { ...rule, isValid: /[!@#$%^&*]/.test(inputPassword) };
        case "length":
          return { ...rule, isValid: inputPassword.length >= 6 };
        default:
          return rule;
      }
    });
    setValidationRules(updatedRules);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = {};

    validationErrors.user_name = validate("user_name", user_name);
    validationErrors.email = validate("email", email);
    validationErrors.password = validate("password", password);
    validationErrors.user_role = validate("user_role", user_role);

    // Remove empty error messages
    const filteredErrors = Object.fromEntries(
      Object.entries(validationErrors).filter(([_, v]) => v)
    );

    if (Object.keys(filteredErrors).length > 0) {
      setErrors(filteredErrors);
      return;
    }

    // Proceed with API call
    try {
      await axios.post("users/register", {
        user_name,
        email,
        password,
        user_role,
      });

      // Reset form fields and errors
      setUserName("");
      setEmail("");
      setPassword("");
      setUserRole("user");
      setErrors({});
      alert("User created successfully!");
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user. Please try again.");
    }
  };

  return (
    <div className="p-2 bg-white rounded-lg">
      <form onSubmit={handleSubmit}>
        <Typography variant="h4" gutterBottom>
          Create User
        </Typography>
        <Grid container spacing={2}>
          {/* First Row: Username, Email, and Role */}
          <Grid item xs={12} md={4}>
            <InputField
              id="user_name"
              label="Username"
              type="text"
              value={user_name}
              onChange={(e) => setUserName(e.target.value)}
              error={errors.user_name}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <InputField
              id="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <SelectField
              id="user_role"
              label="Role"
              value={user_role}
              onChange={(e) => setUserRole(e.target.value)}
              options={["user", "admin"]}
              error={errors.user_role}
            />
          </Grid>

          {/* Second Row: Password Field */}
          <Grid item xs={12} md={6}>
            <InputField
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              error={errors.password}
              helperText={errors.password || ""}
              inputProps={{
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
          </Grid>

          {/* Third Row: Password Requirements */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Password Requirements:
            </Typography>
            <List dense>
              {validationRules.map((rule) => (
                <ListItem key={rule.id}>
                  <ListItemIcon>
                    {rule.isValid ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <CancelIcon color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={rule.text}
                    sx={{ color: rule.isValid ? "green" : "gray" }}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12} sx={{ textAlign: "right" }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "rgb(31 41 55)",
                textTransform: "capitalize",
                fontSize: "1rem",
                borderRadius: "10px",
                color: "white",
                borderColor: "rgb(31 41 55)",
                marginTop: 2,
                paddingX: 4,
              }}
            >
              Create User
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default CreateUser;
