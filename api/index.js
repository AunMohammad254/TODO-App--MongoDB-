const serverless = require('serverless-http');
const app = require('../app/src/app');
const connectDatabase = require('../app/src/utils/database');
const { initializeDatabase } = require('../app/src/utils/initialize-database');

// Ensure database connection for serverless environment
let dbInitialized = false;

const ensureDbConnection = async () => {
  if (!dbInitialized) {
    try {
      console.log('🔄 Initializing database connection in serverless function...');
      console.log('Environment:', process.env.NODE_ENV);
      console.log('Vercel:', process.env.VERCEL);
      console.log('MongoDB URI available:', !!process.env.MONGO_URI_PROD || !!process.env.MONGO_URI || !!process.env.MONGODB_URI);
      
      await connectDatabase();
      await initializeDatabase();
      dbInitialized = true;
      console.log('✅ Database initialized for serverless function');
    } catch (error) {
      console.error('❌ Database initialization failed:', error.message);
      console.error('Full error:', error);
      throw error;
    }
  }
};

// Wrap the serverless handler to ensure database connection
const handler = serverless(app);

module.exports = async (req, res) => {
  try {
    // For health endpoint, don't require database connection
    if (req.url === '/api/health') {
      return await handler(req, res);
    }
    
    await ensureDbConnection();
    return await handler(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    
    // If database connection fails, still allow the request to proceed
    // The individual route handlers will handle database unavailability
    console.log('⚠️ Proceeding without database connection, letting route handlers decide');
    return await handler(req, res);
  }
};