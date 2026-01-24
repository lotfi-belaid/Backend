const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');

// Load config (includes dotenv)
const config = require('./config');
const { connectToMongoDB } = require('./config/db');

// Import routes
const indexRouter = require('./routes/index');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');

// Import error handler
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

// Middleware
app.use(logger('dev'));
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/index', indexRouter);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);

// Backward compatibility - keep old /users routes working
const usersRouter = require('./routes/usersRouter');
app.use('/users', usersRouter);

// 404 handler
app.use((req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Global error handler
app.use(errorHandler);

// Create and start server
const server = http.createServer(app);

server.listen(config.port, () => {
    connectToMongoDB();
    console.log(`Server is running on port ${config.port}`);
});

module.exports = app;
