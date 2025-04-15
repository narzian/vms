import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
} from "@mui/material";
import LoginCarousel from "../reusable/loginCarousel";
import logo from "../../assets/vms_logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/login",
        { email, password },
        { withCredentials: true }
      );

      console.log("Login response:", res.data);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Grid container component="main" sx={{ height: "100vh" }}>
      {/* Banner Section */}
      <Grid
        item
        xs={false}
        sm={6}
        md={7}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LoginCarousel />
      </Grid>

      {/* Sign-In Section */}
      <Grid
        item
        xs={12}
        sm={6}
        md={5}
        component={Paper}
        elevation={6}
        square
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
          boxShadow: "none",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "400px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img
            src={logo}
            alt="Application Logo"
            style={{
              width: "200px",
              marginBottom: "1rem",
            }}
          />
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: 700,
              marginBottom: "1rem",
              marginTop: "4rem",
            }}
          >
            Welcome Back
          </Typography>
          <Typography
            component="p"
            sx={{
              color: "text.secondary",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            Please sign in to continue.
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: "rgb(31 41 55)",
                textTransform: "capitalize",
                fontSize: "1rem",
                borderRadius: "10px",
                color: "white",
                borderColor: "rgb(31 41 55)",
                "&:hover": {
                  backgroundColor: "rgb(55 65 81)",
                },
              }}
            >
              Sign In
            </Button>
          </Box>
          <Link
            href="#"
            variant="body2"
            sx={{
              mt: 2,
              color: "#1976d2",
              "&:hover": {
                textDecoration: "underline",
                color: "rgb(88 28 135)",
              },
            }}
          >
            Forgot your password?
          </Link>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Login;
