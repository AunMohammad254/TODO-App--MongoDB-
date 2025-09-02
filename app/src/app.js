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
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      styleSrcElem: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "ws://127.0.0.1:3001"],
      frameSrc: ["'self'", "https://vercel.live/"],
    }
  }
}));
app.set('trust proxy', true);
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  // The 'trust proxy' setting is now true, so express-rate-limit will correctly
  // use the X-Forwarded-For header to identify the client's IP address.
  // This resolves the ERR_ERL_UNEXPECTED_X_FORWARDED_FOR error.
  // For more details, refer to: https://express-rate-limit.github.io/ERR_ERL_UNEXPECTED_X_FORWARDED_FOR/
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression and logging
app.use(compression());
app.use(morgan('combined'));

// Serve static files
app.use(express.static(path.join(__dirname, '../../public')));

// Health check (not guarded)
app.get('/api/health', (req, res) => {
  const status = typeof connectDatabase.getStatus === 'function' ? connectDatabase.getStatus() : { isConnected: false };
  res.json({ status: 'ok', db: status.isConnected ? 'connected' : 'disconnected', env: process.env.NODE_ENV || 'development' });
});

// Database connectivity guard for API routes
const dbGuard = (req, res, next) => {
  // Skip database check in test environment
  if (process.env.NODE_ENV === 'test') {
    return next();
  }
  
  const status = typeof connectDatabase.getStatus === 'function' ? connectDatabase.getStatus() : { isConnected: false };
  if (!status.isConnected) {
    return res.status(503).json({ message: 'Service temporarily unavailable: database not connected' });
  }
  next();
};

// API Routes (guarded)
if (process.env.NODE_ENV !== 'test') {
  app.use('/api', dbGuard);
}

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Serve frontend for all other routes
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../../public/index.html'));
// });

// Error handling middleware
app.use(errorHandler);

module.exports = app;