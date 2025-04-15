import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { NextUIProvider } from '@nextui-org/react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './styles/themes';

// Auth Components
import Login from "./components/auth/Login";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import ProtectedRoute from './components/auth/ProtectedRoute';
import Unauthorized from './components/Unauthorized';

// Main Components
import Dashboard from './components/Dashboard';
import DashboardContent from './components/DashboardContent';

// Form Components
import CreateVendor from './components/forms/CreateVendor';
import CreateUser from './components/forms/CreateUser';
import CreateExpense from './components/forms/CreateExpense';
import CreateEngagement from './components/forms/CreateEngagement';
import CreateWorkflow from "./components/workflows/CreateWorkflow";

// List Components
import VendorList from './components/vendors/VendorList';
import EngagementList from './components/engagements/EngagementList';
import ExpenseList from './components/expenses/ExpenseList';
import UserList from './components/users/UserList';
import ManageWorkflow from "./components/workflows/ManageWorkflow";

// Document Management Components
import DocumentManagement from './components/documents/DocumentManagement';


// User Profile Component
import UserProfile from './components/users/UserProfile';

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NextUIProvider>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected routes wrapped in Dashboard layout */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardContent />} />
                
                {/* Vendor routes */}
                <Route path="vendors">
                  <Route path="create" element={<CreateVendor />} />
                  <Route path="list" element={<VendorList />} />
                </Route>
                
                {/* Engagement routes */}
                <Route path="engagements">
                  <Route path="create" element={<CreateEngagement />} />
                  <Route path="list" element={<EngagementList />} />
                </Route>
                
                {/* Expense routes */}
                <Route path="expenses">
                  <Route path="create" element={<CreateExpense />} />
                  <Route path="list" element={<ExpenseList />} />
                </Route>

                {/* Workflow routes */}
                <Route path="workflows">
                  <Route path="create" element={<CreateWorkflow />} />
                  <Route path="manage" element={<ManageWorkflow />} />
                </Route>
                
                {/* Document Management routes */}
                <Route path="documents">
                  <Route index element={<DocumentManagement />} />
                </Route>
                
                {/* User routes - Admin only */}
                <Route path="users">
                  <Route path="create" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <CreateUser />
                    </ProtectedRoute>
                  } />
                  <Route path="list" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <UserList />
                    </ProtectedRoute>
                  } />
                </Route>
                
                {/* User Profile - Available to all authenticated users */}
                <Route path="profile" element={<UserProfile />} />
              </Route>
            </Routes>
          </AuthProvider>
        </NextUIProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
