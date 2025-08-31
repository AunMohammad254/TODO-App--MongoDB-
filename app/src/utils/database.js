const mongoose = require('mongoose');
const config = require('../../../config/app.config');

let isConnected = false;

const connectDatabase = async () => {
  try {
    // Validate connection string exists
    if (!config.mongodb.uri) {
      throw new Error('MongoDB connection string is not provided');
    }

    // Set up connection event listeners
    mongoose.connection.on('connected', () => {
      isConnected = true;
      console.log('✅ MongoDB Atlas connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      console.log('🔄 MongoDB reconnected');
    });

    // Handle application termination (avoid exiting in serverless environments)
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        if (!process.env.VERCEL) {
          process.exit(0);
        }
      } catch (error) {
        console.error('Error closing MongoDB connection:', error.message);
        if (!process.env.VERCEL) {
          process.exit(1);
        }
      }
    });

    // Connect to MongoDB Atlas
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    
    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log('🏓 MongoDB Atlas ping successful');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Log specific connection errors
    if (error.name === 'MongoServerSelectionError') {
      console.error('💡 Possible causes:');
      console.error('   - Network connectivity issues');
      console.error('   - Incorrect connection string');
      console.error('   - Database server is down');
      console.error('   - Firewall blocking connection');
    } else if (error.name === 'MongoParseError') {
      console.error('💡 Connection string format is invalid');
    } else if (error.message.includes('authentication')) {
      console.error('💡 Authentication failed - check username/password');
    }
    
    // In serverless environments (e.g., Vercel), do not exit the process; rethrow instead
    if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

// Expose connection status for health checks and middleware
connectDatabase.getStatus = () => ({ isConnected });

module.exports = connectDatabase;
