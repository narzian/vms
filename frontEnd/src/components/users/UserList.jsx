import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

export default function UserList() {
    // This will be replaced with actual data from your API
    const users = [
        {
            id: 1,
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
            status: 'active',
            lastLogin: '2024-03-15'
        },
        // Add more sample data as needed
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                User Management
            </Typography>
            <Paper sx={{ 
                p: 3, 
                bgcolor: '#fff', 
                borderRadius: 2, 
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                overflow: 'hidden'
            }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Last Login</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={user.role}
                                            color={user.role === 'admin' ? 'primary' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={user.status}
                                            color={user.status === 'active' ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{user.lastLogin}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" color="primary">
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton size="small" color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
} 