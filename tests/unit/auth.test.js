const request = require('supertest');

// Mock the User model before importing the app
const mockUsers = [];

jest.mock('../../app/src/models/user', () => {
  return class MockUser {
    constructor(userData) {
      this.username = userData.username;
      this.email = userData.email;
      this.password = userData.password;
      this._id = 'mock-user-id-' + Date.now();
      this.isActive = true; // Default to active
    }

    async save() {
      // Check for duplicate username or email
      const existing = mockUsers.find(u => u.username === this.username || u.email === this.email);
      if (existing) {
        const error = new Error('User already exists');
        error.code = 11000; // MongoDB duplicate key error
        throw error;
      }
      mockUsers.push(this);
      return Promise.resolve(this);
    }

    static async findOne(query) {
      // Handle $or queries
      if (query.$or) {
        for (const condition of query.$or) {
          const user = mockUsers.find(u => {
            return Object.keys(condition).every(key => u[key] === condition[key]);
          });
          if (user) return Promise.resolve(user);
        }
        return Promise.resolve(null);
      }
      
      // Handle simple queries
      if (query.username) {
        const user = mockUsers.find(u => u.username === query.username);
        return Promise.resolve(user || null);
      }
      if (query.email) {
        const user = mockUsers.find(u => u.email === query.email);
        return Promise.resolve(user || null);
      }
      return Promise.resolve(null);
    }

    static async deleteOne(query) {
      const index = mockUsers.findIndex(u => 
        (query.username && u.username === query.username) ||
        (query.email && u.email === query.email)
      );
      if (index > -1) {
        mockUsers.splice(index, 1);
        return Promise.resolve({ deletedCount: 1 });
      }
      return Promise.resolve({ deletedCount: 0 });
    }

    static async find(query = {}) {
      return Promise.resolve(mockUsers.slice());
    }

    // Method to compare password (for login)
    async comparePassword(password) {
      // Simple mock comparison - in real app this would use bcrypt
      return Promise.resolve(this.password === password);
    }

    // Static method to clear mock data between tests
    static clearMockData() {
      mockUsers.length = 0;
    }
  };
});

const app = require('../../app/src/app');
const User = require('../../app/src/models/user');

describe('Authentication', () => {
  beforeEach(() => {
    // Clear mock data before each test
    User.clearMockData();
  });

  describe('POST /api/auth/register', () => {
    test('Should register a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('Should not register user with invalid email', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
    });

    test('Should not register user with duplicate username', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...userData, email: 'different@example.com' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();
    });

    test('Should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.username).toBe('testuser');
    });

    test('Should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });
});