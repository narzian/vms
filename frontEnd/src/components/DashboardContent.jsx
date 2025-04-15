import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    IconButton,
    Tooltip,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import {
    Business as BusinessIcon,
    Assignment as AssignmentIcon,
    Receipt as ReceiptIcon,
    TrendingUp as TrendingUpIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    AttachMoney as AttachMoneyIcon,
    Category as CategoryIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import axios from '../apis/axios';

export default function DashboardContent() {
    const [stats, setStats] = useState({
        totalVendors: 0,
        activeVendors: 0,
        totalEngagements: 0,
        activeEngagements: 0,
        totalExpenses: 0,
        pendingExpenses: 0,
        expensesByMonth: [],
        expensesByCategory: [],
        vendorsByTier: [],
        recentExpenses: [],
        topVendors: [],
        engagementsByStatus: [],
        engagementTrend: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch vendors
                const vendorsRes = await axios.get('vendors');
                const vendors = vendorsRes.data;
                const activeVendors = vendors.filter(v => v.vendor_status === 'Active');

                // Fetch engagements
                const engagementsRes = await axios.get('engagements');
                const engagements = engagementsRes.data;
                const activeEngagements = engagements.filter(e => e.engagement_status === 'Active');

                // Fetch expenses
                const expensesRes = await axios.get('expenses');
                const expenses = expensesRes.data;
                const pendingExpenses = expenses.filter(e => e.expense_status === 'Pending');

                // Calculate expenses by month
                const expensesByMonth = calculateExpensesByMonth(expenses);
                
                // Calculate expenses by category
                const expensesByCategory = calculateExpensesByCategory(expenses);
                
                // Calculate vendors by tier
                const vendorsByTier = calculateVendorsByTier(vendors);
                
                // Get recent expenses
                const recentExpenses = getRecentExpenses(expenses);
                
                // Get top vendors by expense amount
                const topVendors = getTopVendors(vendors, expenses);
                
                // Calculate engagements by status
                const engagementsByStatus = calculateEngagementsByStatus(engagements);
                
                // Calculate engagement trend (simulated data for now)
                const engagementTrend = calculateEngagementTrend(engagements);

                setStats({
                    totalVendors: vendors.length,
                    activeVendors: activeVendors.length,
                    totalEngagements: engagements.length,
                    activeEngagements: activeEngagements.length,
                    totalExpenses: expenses.reduce((sum, exp) => sum + parseFloat(exp.expense_amount || 0), 0),
                    pendingExpenses: pendingExpenses.length,
                    expensesByMonth,
                    expensesByCategory,
                    vendorsByTier,
                    recentExpenses,
                    topVendors,
                    engagementsByStatus,
                    engagementTrend
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchDashboardData();
    }, []);

    const calculateExpensesByMonth = (expenses) => {
        const monthlyData = {};
        expenses.forEach(expense => {
            if (!expense.expense_start_date) return;
            const date = new Date(expense.expense_start_date);
            const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            monthlyData[monthYear] = (monthlyData[monthYear] || 0) + parseFloat(expense.expense_amount || 0);
        });

        return Object.entries(monthlyData).map(([name, amount]) => ({ name, amount }));
    };
    
    const calculateExpensesByCategory = (expenses) => {
        const categoryData = {};
        expenses.forEach(expense => {
            if (!expense.expense_category) return;
            categoryData[expense.expense_category] = (categoryData[expense.expense_category] || 0) + parseFloat(expense.expense_amount || 0);
        });

        return Object.entries(categoryData).map(([name, value]) => ({ name, value }));
    };
    
    const calculateVendorsByTier = (vendors) => {
        const tierData = {};
        vendors.forEach(vendor => {
            if (!vendor.vendor_tier) return;
            tierData[vendor.vendor_tier] = (tierData[vendor.vendor_tier] || 0) + 1;
        });

        return Object.entries(tierData).map(([name, value]) => ({ name, value }));
    };
    
    const getRecentExpenses = (expenses) => {
        return expenses
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);
    };
    
    const getTopVendors = (vendors, expenses) => {
        // Group expenses by vendor
        const vendorExpenses = {};
        expenses.forEach(expense => {
            if (!expense.vendor_id) return;
            vendorExpenses[expense.vendor_id] = (vendorExpenses[expense.vendor_id] || 0) + parseFloat(expense.expense_amount || 0);
        });
        
        // Map vendor IDs to vendor names and sort by expense amount
        return Object.entries(vendorExpenses)
            .map(([vendorId, amount]) => {
                const vendor = vendors.find(v => v.vendor_id === parseInt(vendorId));
                return {
                    id: vendorId,
                    name: vendor ? vendor.vendor_name : `Vendor ${vendorId}`,
                    amount
                };
            })
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
    };
    
    const calculateEngagementsByStatus = (engagements) => {
        const statusData = {};
        engagements.forEach(engagement => {
            if (!engagement.engagement_status) return;
            statusData[engagement.engagement_status] = (statusData[engagement.engagement_status] || 0) + 1;
        });

        return Object.entries(statusData).map(([name, value]) => ({ name, value }));
    };
    
    const calculateEngagementTrend = (engagements) => {
        // This would ideally use real data, but for now we'll create a simulated trend
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        return months.map(month => ({
            name: month,
            count: Math.floor(Math.random() * 10) + 1
        }));
    };

    const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                        p: 1, 
                        borderRadius: 1, 
                        bgcolor: `${color}.lighter`,
                        color: `${color}.main`,
                        mr: 2
                    }}>
                        {icon}
                    </Box>
                    <Typography variant="h6" color="text.secondary">
                        {title}
                    </Typography>
                    
                    {trend && (
                        <Box sx={{ 
                            ml: 'auto', 
                            display: 'flex', 
                            alignItems: 'center',
                            color: trend > 0 ? 'success.main' : 'error.main'
                        }}>
                            {trend > 0 ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {Math.abs(trend)}%
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Typography variant="h4" sx={{ mb: 1 }}>
                    {value}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };
    
    const COLORS = ['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>
                Dashboard Overview
            </Typography>

            <Grid container spacing={3}>
                {/* Vendor Stats */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Vendors"
                        value={stats.totalVendors}
                        icon={<BusinessIcon />}
                        color="primary"
                        subtitle={`${stats.activeVendors} active vendors`}
                        trend={12}
                    />
                </Grid>

                {/* Engagement Stats */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Engagements"
                        value={stats.totalEngagements}
                        icon={<AssignmentIcon />}
                        color="info"
                        subtitle={`${stats.activeEngagements} active engagements`}
                        trend={8}
                    />
                </Grid>

                {/* Expense Stats */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Expenses"
                        value={formatCurrency(stats.totalExpenses)}
                        icon={<ReceiptIcon />}
                        color="success"
                        subtitle={`${stats.pendingExpenses} pending approvals`}
                        trend={15}
                    />
                </Grid>

                {/* Vendor Performance */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Vendor Performance"
                        value={`${Math.round((stats.activeVendors / stats.totalVendors) * 100 || 0)}%`}
                        icon={<TrendingUpIcon />}
                        color="warning"
                        subtitle="Active vendor ratio"
                        trend={-5}
                    />
                </Grid>

                {/* Expenses by Category */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 3 }}>
                                Expenses by Category
                            </Typography>
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.expensesByCategory}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {stats.expensesByCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Vendors by Tier */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 3 }}>
                                Vendors by Tier
                            </Typography>
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.vendorsByTier}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Bar dataKey="value" fill="#8884d8">
                                            {stats.vendorsByTier.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Expenses Chart */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 3 }}>
                                Expense Trends
                            </Typography>
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.expensesByMonth}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <RechartsTooltip 
                                            formatter={(value) => formatCurrency(value)}
                                        />
                                        <Bar dataKey="amount" fill="#6366F1" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Top Vendors */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Top Vendors by Expense
                            </Typography>
                            <List>
                                {stats.topVendors.map((vendor, index) => (
                                    <ListItem key={vendor.id} divider={index < stats.topVendors.length - 1}>
                                        <ListItemIcon>
                                            {index < 3 ? <StarIcon color="warning" /> : <StarBorderIcon />}
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={vendor.name} 
                                            secondary={formatCurrency(vendor.amount)}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Expenses */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Recent Expenses
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Engagement</TableCell>
                                            <TableCell>Category</TableCell>
                                            <TableCell>Amount</TableCell>
                                            <TableCell>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {stats.recentExpenses.map((expense) => (
                                            <TableRow key={expense.expense_id}>
                                                <TableCell>{expense.engagement_name || 'N/A'}</TableCell>
                                                <TableCell>{expense.expense_category || 'N/A'}</TableCell>
                                                <TableCell>{formatCurrency(expense.expense_amount)}</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={expense.expense_status || 'N/A'} 
                                                        size="small"
                                                        color={
                                                            expense.expense_status === 'Approved' ? 'success' :
                                                            expense.expense_status === 'Pending' ? 'warning' :
                                                            expense.expense_status === 'Rejected' ? 'error' : 'default'
                                                        }
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Engagement Trend */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 3 }}>
                                Engagement Trend
                            </Typography>
                            <Box sx={{ height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats.engagementTrend}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Line type="monotone" dataKey="count" stroke="#6366F1" activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
} 