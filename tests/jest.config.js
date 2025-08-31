module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'app/src/**/*.js',
    '!app/src/server.js',
    '!**/node_modules/**'
  ],
  testTimeout: 30000,
  setupFiles: ['<rootDir>/test-env.js']
};