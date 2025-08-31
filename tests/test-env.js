// Set NODE_ENV to test before running tests
process.env.NODE_ENV = 'test';

// Set required environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRATION = '1h';
process.env.BCRYPT_SALT_ROUNDS = '10';

// Debug: Verify environment variables are set
console.log('Test environment variables loaded:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');