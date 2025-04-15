require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// CORS configuration
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight requests
app.options('*', cors());

// Other middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Import Routes
const userRoutes = require("./routes/users");
const vendorRoutes = require("./routes/vendor");
const engagementRoutes = require("./routes/engagement");
const expenseRoutes = require("./routes/expense");
const departmentRoutes = require("./routes/departments");
const documentRoutes = require("./routes/documents");
const documentCategoryRoutes = require("./routes/documentCategories");

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/engagements", engagementRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/document-categories", documentCategoryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
