const mongoose = require('mongoose');
const config = require('../../config/config');

const connectDatabase = async () => {
  try {
    // Validate connection string exists
    if (!config.mongodb.uri) {
      throw new Error('MongoDB connection string is not provided');
    }

    // Set up connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB Atlas connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('Error closing MongoDB connection:', error.message);
        process.exit(1);
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
    
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDatabase;
