const mongoose = require('mongoose');
const User = require('../models/user');
const Task = require('../models/task');
const config = require('../../config/config');

/**
 * Initialize database with proper indexes and sample data for MongoDB Compass visibility
 */
const initializeDatabase = async () => {
  try {
    console.log('🔧 Initializing database indexes and collections...');
    
    // Ensure indexes are created for User model
    console.log('📊 Creating User collection indexes...');
    try {
      await User.createIndexes();
      console.log('✅ User indexes created successfully');
    } catch (error) {
      if (error.message.includes('Index already exists')) {
        console.log('ℹ️  User indexes already exist, skipping creation');
      } else {
        throw error;
      }
    }
    
    // Ensure indexes are created for Task model
    console.log('📊 Creating Task collection indexes...');
    try {
      await Task.createIndexes();
      console.log('✅ Task indexes created successfully');
    } catch (error) {
      if (error.message.includes('Index already exists')) {
        console.log('ℹ️  Task indexes already exist, skipping creation');
      } else {
        throw error;
      }
    }
    
    // Get collection stats for MongoDB Compass visibility
    const db = mongoose.connection.db;
    
    // Check if collections exist and create them if they don't
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    console.log('📋 Available collections:', collectionNames);
    
    // Ensure users collection exists
    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
      console.log('✅ Users collection created');
    }
    
    // Ensure tasks collection exists
    if (!collectionNames.includes('tasks')) {
      await db.createCollection('tasks');
      console.log('✅ Tasks collection created');
    }
    
    // Get database stats
    const stats = await db.stats();
    console.log('📊 Database Statistics:');
    console.log(`   - Database: ${stats.db}`);
    console.log(`   - Collections: ${stats.collections}`);
    console.log(`   - Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    
    // List all indexes for verification
    console.log('🔍 Verifying indexes...');
    
    const userIndexes = await User.collection.getIndexes();
    console.log('👤 User collection indexes:', Object.keys(userIndexes));
    
    const taskIndexes = await Task.collection.getIndexes();
    console.log('📝 Task collection indexes:', Object.keys(taskIndexes));
    
    // Verify connection to MongoDB Atlas
    const adminDb = db.admin();
    const serverStatus = await adminDb.serverStatus();
    console.log('🌐 MongoDB Atlas Connection Verified:');
    console.log(`   - Host: ${serverStatus.host}`);
    console.log(`   - Version: ${serverStatus.version}`);
    console.log(`   - Uptime: ${Math.floor(serverStatus.uptime / 3600)} hours`);
    
    console.log('✅ Database initialization completed successfully!');
    console.log('🔍 Your data should now be visible in MongoDB Compass');
    
    return {
      success: true,
      collections: collectionNames,
      userIndexes: Object.keys(userIndexes),
      taskIndexes: Object.keys(taskIndexes),
      stats
    };
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

/**
 * Create sample data for testing MongoDB Compass visibility
 */
const createSampleData = async () => {
  try {
    console.log('📝 Creating sample data for MongoDB Compass visibility...');
    
    // Check if sample data already exists
    const userCount = await User.countDocuments();
    const taskCount = await Task.countDocuments();
    
    if (userCount > 0 && taskCount > 0) {
      console.log('ℹ️  Sample data already exists, skipping creation');
      return { message: 'Sample data already exists' };
    }
    
    // Create sample user if none exists
    let sampleUser;
    if (userCount === 0) {
      sampleUser = new User({
        username: 'compass_demo_user',
        email: 'demo@compass.example.com',
        password: 'demo123456'
      });
      await sampleUser.save();
      console.log('👤 Sample user created for MongoDB Compass');
    } else {
      sampleUser = await User.findOne();
    }
    
    // Create sample tasks if none exist
    if (taskCount === 0) {
      const sampleTasks = [
        {
          title: 'Setup MongoDB Compass',
          description: 'Configure MongoDB Compass to view database collections',
          priority: 'high',
          status: 'Completed',
          userId: sampleUser._id,
          completed: true,
          completedAt: new Date()
        },
        {
          title: 'Verify Database Connection',
          description: 'Ensure secure connection to MongoDB Atlas',
          priority: 'high',
          status: 'In Progress',
          userId: sampleUser._id,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
        },
        {
          title: 'Test Data Indexing',
          description: 'Verify that database indexes are working properly',
          priority: 'medium',
          status: 'Pending',
          userId: sampleUser._id,
          dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000) // Day after tomorrow
        }
      ];
      
      await Task.insertMany(sampleTasks);
      console.log('📝 Sample tasks created for MongoDB Compass');
    }
    
    console.log('✅ Sample data creation completed!');
    return { message: 'Sample data created successfully' };
    
  } catch (error) {
    console.error('❌ Sample data creation failed:', error.message);
    throw error;
  }
};

module.exports = {
  initializeDatabase,
  createSampleData
};