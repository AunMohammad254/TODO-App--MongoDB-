const mongoose = require('mongoose');

// Mock User model
jest.mock('../app/src/models/user');

// Increase the timeout for tests
jest.setTimeout(60000); // 60 seconds

// Mock mongoose for testing
beforeAll(async () => {
  try {
    console.log('Setting up test environment with mocked database...');
    
    // Mock mongoose connection
    mongoose.connection.readyState = 1; // Connected state
    mongoose.connection.name = 'test';
    mongoose.connection.host = 'localhost';
    
    console.log('Test database setup complete.');
  } catch (error) {
    console.error('Error during beforeAll setup:', error);
    throw error;
  }
}, 60000);

afterAll(async () => {
  try {
    console.log('Cleaning up test environment...');
    // Reset mongoose connection state
    mongoose.connection.readyState = 0;
    mongoose.connection.name = undefined;
    mongoose.connection.host = undefined;
    console.log('Test cleanup complete.');
  } catch (error) {
    console.error('Error during afterAll teardown:', error);
    throw error;
  }
});

afterEach(async () => {
  // Mock cleanup - in a real test environment, this would clear collections
  console.log('Test case cleanup complete.');
});