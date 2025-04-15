import React from 'react';
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    MenuItem,
    Avatar,
    Tooltip,
    Divider
} from '@mui/material';
import {
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
    AccountCircle as AccountCircleIcon,
    Business as BusinessIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onToggleSidebar }) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [notificationsAnchorEl, setNotificationsAnchorEl] = React.useState(null);
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleNotificationsMenu = (event) => {
        setNotificationsAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationsClose = () => {
        setNotificationsAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <AppBar 
            position="fixed" 
            sx={{ 
                zIndex: (theme) => theme.zIndex.drawer + 1,
                bgcolor: 'white',
                color: 'text.primary',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onToggleSidebar}
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>

                {/* Logo and System Name */}
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
                    <BusinessIcon sx={{ fontSize: 32, color: '#6366F1', mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ 
                            display: { xs: 'none', sm: 'block' },
                            fontWeight: 600,
                            color: '#6366F1'
                        }}
                    >
                        Vendor Management System
                    </Typography>
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                {/* Notifications */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Notifications">
                        <IconButton
                            size="large"
                            aria-label="show notifications"
                            color="inherit"
                            onClick={handleNotificationsMenu}
                        >
                            <NotificationsIcon />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={notificationsAnchorEl}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(notificationsAnchorEl)}
                        onClose={handleNotificationsClose}
                    >
                        <MenuItem onClick={handleNotificationsClose}>
                            No new notifications
                        </MenuItem>
                    </Menu>

                    {/* Settings */}
                    <Tooltip title="Settings">
                        <IconButton
                            size="large"
                            aria-label="settings"
                            color="inherit"
                            sx={{ ml: 1 }}
                        >
                            <SettingsIcon />
                        </IconButton>
                    </Tooltip>

                    {/* User Menu */}
                    <Tooltip title="Account settings">
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                            sx={{ ml: 1 }}
                        >
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366F1' }}>
                                <AccountCircleIcon />
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <Box sx={{ px: 2, py: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {user?.name || 'Admin User'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {user?.email || 'admin@example.com'}
                            </Typography>
                        </Box>
                        <Divider />
                        <MenuItem onClick={handleClose}>Profile</MenuItem>
                        <MenuItem onClick={handleClose}>My account</MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
} 