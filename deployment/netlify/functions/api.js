const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import your existing app components
const connectDatabase = require('../../../app/src/utils/database');
const { initializeDatabase } = require('../../../app/src/utils/initialize-database');
const authRoutes = require('../../../app/src/routes/auth');
const taskRoutes = require('../../../app/src/routes/tasks');
const errorHandler = require('../../../app/src/middleware/error-handler');

const app = express();

// Trust proxy for Netlify serverless environment
app.set('trust proxy', true);

// Initialize database connection with optimization for serverless
let dbInitialized = false;
let dbInitPromise = null;

const initDB = async () => {
  if (dbInitialized) return;
  
  // Prevent multiple simultaneous initialization attempts
  if (dbInitPromise) {
    return dbInitPromise;
  }
  
  dbInitPromise = (async () => {
    try {
      // Check for required environment variables
      const missingVars = [];
      if (!process.env.MONGO_URI) {
        missingVars.push('MONGO_URI');
      }
      if (!process.env.JWT_SECRET) {
        missingVars.push('JWT_SECRET');
      }
      
      if (missingVars.length > 0) {
        const errorMsg = `Missing required environment variables: ${missingVars.join(', ')}. Please configure these in your Netlify dashboard under Site settings > Environment variables.`;
        console.error('Environment Configuration Error:', errorMsg);
        throw new Error(errorMsg);
      }
      
      // Set connection timeout for serverless environment
      const originalUri = process.env.MONGO_URI;
      if (!originalUri.includes('serverSelectionTimeoutMS')) {
        process.env.MONGO_URI = originalUri + (originalUri.includes('?') ? '&' : '?') + 'serverSelectionTimeoutMS=5000&socketTimeoutMS=10000&maxPoolSize=10&minPoolSize=1';
      }
      
      await connectDatabase();
      await initializeDatabase();
      dbInitialized = true;
      console.log('Database initialized for serverless function with optimized connection settings');
    } catch (error) {
      console.error('Database initialization failed:', error.message);
      dbInitPromise = null; // Reset promise on failure
      throw error; // Re-throw to prevent function from continuing with invalid state
    }
  })();
  
  return dbInitPromise;
};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      styleSrcElem: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https://cluster0.xxothym.mongodb.net"]
    }
  }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-netlify-domain.netlify.app'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Rate limiting - configured for serverless environment
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use a more reliable key generator for serverless environments
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
  },
  // Skip rate limiting if IP cannot be determined
  skip: (req) => {
    const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    return !ip || ip === 'unknown';
  }
});
app.use(limiter);

// Body parsing middleware - optimized for serverless
app.use(express.json({ 
  limit: '5mb', // Reduced for serverless efficiency
  strict: true,
  type: 'application/json'
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '5mb',
  parameterLimit: 1000 // Prevent parameter pollution
}));

// Request timeout middleware for serverless environment
app.use((req, res, next) => {
  // Set timeout for serverless functions (Netlify has 10s limit)
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({
        error: 'Request Timeout',
        message: 'Request took too long to process'
      });
    }
  }, 8000); // 8 seconds to leave buffer for Netlify
  
  res.on('finish', () => clearTimeout(timeout));
  res.on('close', () => clearTimeout(timeout));
  
  next();
});

// Initialize database before handling requests
app.use(async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (error) {
    console.error('Failed to initialize database:', error.message);
    res.status(500).json({ 
      error: 'Database connection failed', 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling
app.use(errorHandler);

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Enhanced serverless function handler with error handling
const serverlessHandler = serverless(app, {
  binary: ['image/*', 'application/pdf']
});

module.exports.handler = async (event, context) => {
  try {
    // Ensure database is initialized before handling requests
    if (!dbInitialized) {
      await initDB();
    }
    return await serverlessHandler(event, context);
  } catch (error) {
    console.error('Serverless function error:', error.message);
    
    // Return proper HTTP error response for environment configuration issues
    if (error.message.includes('Missing required environment variables')) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        },
        body: JSON.stringify({
          error: 'Server Configuration Error',
          message: 'The server is not properly configured. Please contact the administrator.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
      };
    }
    
    // Return generic error for other issues
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred. Please try again later.'
      })
    };
  }
};