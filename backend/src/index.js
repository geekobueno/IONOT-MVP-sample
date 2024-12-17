const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const connectDB = require('./config/database');


// Import Routes
const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidatesRoutes');
const adminRoutes = require('./routes/adminRoutes');
const projectRoutes = require('./routes/projectRoutes');
const progressRoutes = require('./routes/progressRoutes');

//connect to db
connectDB();

// Create Express App
const app = express();

// Security Middleware
app.use(helmet());

// Compression Middleware
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4000',
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/progress', progressRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Determine error response based on environment
  const errorResponse = process.env.NODE_ENV === 'production'
    ? {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      }
    : {
        error: err.message,
        stack: err.stack
      };

  res.status(err.status || 500).json(errorResponse);
});

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

module.exports = app;