const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDatabase = require('./utils/database');
const { initializeDatabase, createSampleData } = require('./utils/initialize-database');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const errorHandler = require('./middleware/error-handler');

const app = express();

// Connect to database and initialize (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  connectDatabase().then(async () => {
    try {
      // Initialize database indexes and collections for MongoDB Compass
      await initializeDatabase();
      
      // Create sample data if needed (only in development)
      if (process.env.NODE_ENV === 'development') {
        await createSampleData();
      }
    } catch (error) {
      console.error('Database initialization error:', error.message);
    }
  }).catch(error => {
    console.error('Database connection failed:', error.message);
  });
}

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression and logging
app.use(compression());
app.use(morgan('combined'));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;