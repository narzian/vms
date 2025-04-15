import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
    Container,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Collapse,
    Menu,
    MenuItem,
    Avatar
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Business as BusinessIcon,
    Assignment as AssignmentIcon,
    Receipt as ReceiptIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    ExpandMore as ExpandMoreIcon,
    Add as AddIcon,
    List as ListIcon,
    Person as PersonIcon,
    AccountCircle as AccountCircleIcon,
    VpnKey as VpnKeyIcon,
    AccountTree as WorkflowIcon,
    FolderCopy as DocumentIcon,
} from '@mui/icons-material';

const drawerWidth = 280;

// Modern color scheme
const theme = {
    primary: '#6366F1', // Modern indigo
    secondary: '#EC4899', // Modern pink
    background: '#F9FAFB',
    drawer: '#FFFFFF',
    text: '#111827',
    lightText: '#6B7280',
    success: '#10B981', // Modern green
    error: '#EF4444', // Modern red
    warning: '#F59E0B', // Modern yellow
};

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedAccordion, setExpandedAccordion] = useState('');
    const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpandedAccordion(isExpanded ? panel : '');
    };

    const handleProfileMenuOpen = (event) => {
        setProfileMenuAnchor(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setProfileMenuAnchor(null);
    };

    const handleProfileClick = () => {
        handleProfileMenuClose();
        navigate('/profile');
    };

    const handleForgotPasswordClick = () => {
        handleProfileMenuClose();
        navigate('/forgot-password');
    };

    const menuItems = [
        {
            id: 'dashboard',
            text: 'Dashboard',
            icon: <DashboardIcon />,
            path: '/dashboard',
            type: 'item'
        },
        {
            id: 'vendors',
            text: 'Vendors',
            icon: <BusinessIcon />,
            type: 'accordion',
            items: [
                { text: 'Create Vendor', icon: <AddIcon />, path: '/vendors/create' },
                { text: 'View Vendors', icon: <ListIcon />, path: '/vendors/list' }
            ]
        },
        {
            id: 'engagements',
            text: 'Engagements',
            icon: <AssignmentIcon />,
            type: 'accordion',
            items: [
                { text: 'Create Engagement', icon: <AddIcon />, path: '/engagements/create' },
                { text: 'View Engagements', icon: <ListIcon />, path: '/engagements/list' }
            ]
        },
        {
            id: 'expenses',
            text: 'Expenses',
            icon: <ReceiptIcon />,
            type: 'accordion',
            items: [
                { text: 'Create Expense', icon: <AddIcon />, path: '/expenses/create' },
                { text: 'View Expenses', icon: <ListIcon />, path: '/expenses/list' }
            ]
        },
        {
            id: 'workflows',
            text: 'Workflows',
            icon: <WorkflowIcon />,
            type: 'accordion',
            items: [
                { text: 'Create Workflow', icon: <AddIcon />, path: '/workflows/create' },
                { text: 'Manage Workflows', icon: <ListIcon />, path: '/workflows/manage' }
            ]
        },
        {
            id: 'users',
            text: 'Users',
            icon: <PeopleIcon />,
            type: 'accordion',
            items: [
                { text: 'Create User', icon: <AddIcon />, path: '/users/create' },
                { text: 'View Users', icon: <ListIcon />, path: '/users/list' }
            ]
        },
        {
            id: 'documents',
            text: 'Documents',
            icon: <DocumentIcon />,
            type: 'item',
            path: '/documents',
        },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <Box sx={{ display: 'flex', bgcolor: theme.background, minHeight: '100vh' }}>
            <AppBar 
                position="fixed" 
                sx={{ 
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: theme.drawer,
                    color: theme.text,
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                }}
            >
                <Toolbar>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
                        VMS Dashboard
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton 
                            onClick={handleProfileMenuOpen}
                            size="large"
                            sx={{ 
                                color: theme.primary,
                                '&:hover': { bgcolor: '#EEF2FF' }
                            }}
                        >
                            <Avatar 
                                sx={{ 
                                    width: 40, 
                                    height: 40, 
                                    bgcolor: theme.primary,
                                    color: 'white'
                                }}
                            >
                                {user?.user_name?.charAt(0) || <PersonIcon />}
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={profileMenuAnchor}
                            open={Boolean(profileMenuAnchor)}
                            onClose={handleProfileMenuClose}
                            PaperProps={{
                                elevation: 3,
                                sx: { 
                                    minWidth: 200,
                                    mt: 1,
                                    borderRadius: 2,
                                    '& .MuiMenuItem-root': {
                                        py: 1.5
                                    }
                                }
                            }}
                        >
                            <Box sx={{ px: 2, py: 1.5 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {user?.user_name || 'User'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {user?.email}
                                </Typography>
                            </Box>
                            <Divider />
                            <MenuItem onClick={handleProfileClick}>
                                <ListItemIcon>
                                    <AccountCircleIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="My Profile" />
                            </MenuItem>
                            <MenuItem onClick={handleForgotPasswordClick}>
                                <ListItemIcon>
                                    <VpnKeyIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="Reset Password" />
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <LogoutIcon fontSize="small" sx={{ color: theme.error }} />
                                </ListItemIcon>
                                <ListItemText primary="Logout" sx={{ color: theme.error }} />
                            </MenuItem>
                        </Menu>
                        <Typography variant="body1" sx={{ color: theme.lightText, display: 'none' }}>
                            {user?.email}
                        </Typography>
                        <Button
                            onClick={handleLogout}
                            startIcon={<LogoutIcon />}
                            sx={{
                                color: theme.error,
                                '&:hover': {
                                    bgcolor: '#FEE2E2'
                                },
                                display: 'none'
                            }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        bgcolor: theme.drawer,
                        border: 'none',
                        boxShadow: '1px 0 3px 0 rgb(0 0 0 / 0.1)',
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto', p: 2 }}>
                    <List>
                        {menuItems.map((item) => (
                            item.type === 'accordion' ? (
                                <Accordion
                                    key={item.id}
                                    expanded={expandedAccordion === item.id}
                                    onChange={handleAccordionChange(item.id)}
                                    sx={{
                                        bgcolor: 'transparent',
                                        boxShadow: 'none',
                                        '&:before': { display: 'none' },
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        sx={{
                                            '&:hover': { bgcolor: '#F3F4F6' },
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            {item.icon}
                                            <Typography>{item.text}</Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 0 }}>
                                        <List>
                                            {item.items.map((subItem) => (
                                                <ListItem
                                                    key={subItem.path}
                                                    button
                                                    onClick={() => navigate(subItem.path)}
                                                    sx={{
                                                        pl: 4,
                                                        borderRadius: 1,
                                                        mb: 0.5,
                                                        bgcolor: location.pathname === subItem.path ? '#F3F4F6' : 'transparent',
                                                        '&:hover': { bgcolor: '#F3F4F6' },
                                                    }}
                                                >
                                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                                        {subItem.icon}
                                                    </ListItemIcon>
                                                    <ListItemText 
                                                        primary={subItem.text}
                                                        primaryTypographyProps={{
                                                            fontSize: '0.875rem',
                                                            color: theme.lightText
                                                        }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </AccordionDetails>
                                </Accordion>
                            ) : (
                                <ListItem
                                    key={item.id}
                                    button
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        borderRadius: 1,
                                        mb: 1,
                                        bgcolor: location.pathname === item.path ? '#F3F4F6' : 'transparent',
                                        '&:hover': { bgcolor: '#F3F4F6' },
                                    }}
                                >
                                    <ListItemIcon>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItem>
                            )
                        ))}
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: theme.background }}>
                <Toolbar />
                <Container maxWidth="lg">
                    <Outlet />
                </Container>
            </Box>
        </Box>
    );
} 