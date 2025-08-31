const request = require('supertest');

// Mock data arrays
const mockUsers = [];
const mockTasks = [];

// Mock the User model
jest.mock('../../app/src/models/user', () => {
  return class MockUser {
    constructor(userData) {
      this.username = userData.username;
      this.email = userData.email;
      this.password = userData.password;
      this._id = userData._id || '507f1f77bcf86cd799439' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'); // Valid ObjectId format
      this.isActive = true;
    }

    async save() {
      const existing = mockUsers.find(u => u.username === this.username || u.email === this.email);
      if (existing) {
        const error = new Error('User already exists');
        error.code = 11000;
        throw error;
      }
      mockUsers.push(this);
      return Promise.resolve(this);
    }

    static async findOne(query) {
      if (query.$or) {
        for (const condition of query.$or) {
          const user = mockUsers.find(u => {
            return Object.keys(condition).every(key => u[key] === condition[key]);
          });
          if (user) return Promise.resolve(user);
        }
        return Promise.resolve(null);
      }
      
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

    static findById(id) {
      const user = mockUsers.find(u => u._id === id) || null;
      return {
        select: (fields) => {
          if (!user) return Promise.resolve(null);
          
          if (fields === '-password') {
            const { password, ...userWithoutPassword } = user;
            return Promise.resolve(userWithoutPassword);
          }
          
          return Promise.resolve(user);
        },
        // For direct usage without select
        then: (resolve) => resolve(user)
      };
    }

    async comparePassword(password) {
      return Promise.resolve(this.password === password);
    }

    static clearMockData() {
      mockUsers.length = 0;
    }
  };
});

// Mock the Task model
jest.mock('../../app/src/models/task', () => {
  return class MockTask {
    constructor(taskData) {
      // Validate required fields
      if (!taskData.title || taskData.title.trim() === '') {
        const error = new Error('Title is required');
        error.name = 'ValidationError';
        throw error;
      }
      
      if (taskData.title && taskData.title.length > 100) {
        const error = new Error('Title cannot exceed 100 characters');
        error.name = 'ValidationError';
        throw error;
      }
      
      if (taskData.description && taskData.description.length > 200) {
        const error = new Error('Description cannot exceed 200 characters');
        error.name = 'ValidationError';
        throw error;
      }
      
      if (taskData.priority && !['low', 'medium', 'high'].includes(taskData.priority)) {
        const error = new Error('Priority must be low, medium, or high');
        error.name = 'ValidationError';
        throw error;
      }
      
      if (taskData.status && !['Pending', 'In Progress', 'Completed'].includes(taskData.status)) {
        const error = new Error('Status must be Pending, In Progress, or Completed');
        error.name = 'ValidationError';
        throw error;
      }
      
      if (taskData.dueDate && new Date(taskData.dueDate) < new Date()) {
        const error = new Error('Due date cannot be in the past');
        error.name = 'ValidationError';
        throw error;
      }
      
      if (!taskData.userId) {
        const error = new Error('UserId is required');
        error.name = 'ValidationError';
        throw error;
      }
      
      this.title = taskData.title.trim();
      this.description = taskData.description ? taskData.description.trim() : taskData.description;
      this.priority = taskData.priority || 'medium';
      this.status = taskData.status || 'Pending';
      this.dueDate = taskData.dueDate;
      this.userId = taskData.userId;
      this._id = taskData._id || '507f1f77bcf86cd799439011'; // Valid ObjectId format
      this.completed = taskData.completed || false;
      this.createdAt = new Date();
      this.updatedAt = new Date();
      this.completedAt = taskData.completedAt;
      
      // Simulate pre-save middleware
      if (this.status === 'Completed') {
        this.completedAt = new Date();
        this.completed = true;
      } else {
        this.completedAt = undefined;
        this.completed = false;
      }
    }

    async save() {
      mockTasks.push(this);
      return Promise.resolve(this);
    }

    static find(query = {}) {
      const results = mockTasks.filter(task => {
        return Object.keys(query).every(key => {
          if (key === 'userId') {
            return task.userId.toString() === query[key].toString();
          }
          return task[key] === query[key];
        });
      });
      
      // Return a chainable query object
      return {
        sort: function(sortObj) {
          const sortKey = Object.keys(sortObj)[0];
          const sortOrder = sortObj[sortKey];
          results.sort((a, b) => {
            if (sortOrder === 1) {
              return a[sortKey] > b[sortKey] ? 1 : -1;
            } else {
              return a[sortKey] < b[sortKey] ? 1 : -1;
            }
          });
          return this;
        },
        limit: function(limitNum) {
          results.splice(limitNum);
          return this;
        },
        skip: function(skipNum) {
          results.splice(0, skipNum);
          return this;
        },
        then: function(resolve) {
          resolve(results);
        }
      };
    }

    static async findById(id) {
      const task = mockTasks.find(t => t._id === id);
      return Promise.resolve(task || null);
    }

    static async findByIdAndUpdate(id, update, options = {}) {
      const taskIndex = mockTasks.findIndex(t => t._id === id);
      if (taskIndex === -1) return Promise.resolve(null);
      
      Object.assign(mockTasks[taskIndex], update);
      mockTasks[taskIndex].updatedAt = new Date();
      
      return Promise.resolve(options.new ? mockTasks[taskIndex] : mockTasks[taskIndex]);
    }

    static async findByIdAndDelete(id) {
      const taskIndex = mockTasks.findIndex(t => t._id === id);
      if (taskIndex === -1) return Promise.resolve(null);
      
      const deletedTask = mockTasks.splice(taskIndex, 1)[0];
      return Promise.resolve(deletedTask);
    }

    static async insertMany(tasks) {
      const insertedTasks = tasks.map(taskData => {
        const task = new this(taskData);
        mockTasks.push(task);
        return task;
      });
      return Promise.resolve(insertedTasks);
    }

    static async findOneAndUpdate(filter, update, options = {}) {
      const task = mockTasks.find(t => {
        if (filter._id && filter.userId) {
          return t._id === filter._id && t.userId === filter.userId;
        }
        return Object.keys(filter).every(key => t[key] === filter[key]);
      });
      
      if (!task) return Promise.resolve(null);
      
      Object.assign(task, update);
      return Promise.resolve(options.new ? task : task);
    }

    static async findOneAndDelete(filter) {
      const taskIndex = mockTasks.findIndex(t => {
        if (filter._id && filter.userId) {
          return t._id === filter._id && t.userId === filter.userId;
        }
        return Object.keys(filter).every(key => t[key] === filter[key]);
      });
      
      if (taskIndex === -1) return Promise.resolve(null);
      
      const deletedTask = mockTasks.splice(taskIndex, 1)[0];
      return Promise.resolve(deletedTask);
    }

    static async countDocuments(filter = {}) {
      const filteredTasks = mockTasks.filter(t => {
        return Object.keys(filter).every(key => {
          if (key === 'userId') {
            return t.userId.toString() === filter[key].toString();
          }
          return t[key] === filter[key];
        });
      });
      return Promise.resolve(filteredTasks.length);
    }

    static async findOneAndUpdate(query, update, options = {}) {
      const taskIndex = mockTasks.findIndex(task => {
        return Object.keys(query).every(key => {
          if (key === 'userId') {
            return task.userId.toString() === query[key].toString();
          }
          return task[key] === query[key];
        });
      });
      
      if (taskIndex === -1) {
        return Promise.resolve(null);
      }
      
      // Update the task
      Object.assign(mockTasks[taskIndex], update);
      
      return Promise.resolve(options.new ? mockTasks[taskIndex] : mockTasks[taskIndex]);
    }

    static async aggregate(pipeline) {
      // Simple mock for aggregation - handle basic grouping
      const matchStage = pipeline.find(stage => stage.$match);
      const groupStage = pipeline.find(stage => stage.$group);
      
      let filteredTasks = mockTasks;
      if (matchStage) {
        filteredTasks = mockTasks.filter(t => {
          return Object.keys(matchStage.$match).every(key => t[key] === matchStage.$match[key]);
        });
      }
      
      if (groupStage) {
        const groups = {};
        filteredTasks.forEach(task => {
          const groupKey = task[groupStage.$group._id.replace('$', '')];
          if (!groups[groupKey]) {
            groups[groupKey] = { _id: groupKey, count: 0 };
          }
          groups[groupKey].count++;
        });
        return Promise.resolve(Object.values(groups));
      }
      
      return Promise.resolve(filteredTasks);
    }

    static clearMockData() {
      mockTasks.length = 0;
    }
  };
});

const app = require('../../app/src/app');
const User = require('../../app/src/models/user');
const Task = require('../../app/src/models/task');
const jwt = require('jsonwebtoken');
const config = require('../../config/app.config');

let user, token;

beforeEach(async () => {
  // Clear mock data before each test
  User.clearMockData();
  Task.clearMockData();
  
  user = new User({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  });
  await user.save();

  token = jwt.sign({ userId: user._id }, config.jwt.secret);
});

describe('Tasks', () => {
  describe('POST /api/tasks', () => {
    test('Should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high',
        status: 'Pending'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.task.title).toBe(taskData.title);
      expect(response.body.task.userId.toString()).toBe(user._id.toString());
    });

    test('Should not create task without title', async () => {
      const taskData = {
        description: 'Test Description',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData);

      expect(response.status).toBe(400);
    });

    test('Should not create task without authentication', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      const tasks = [
        { title: 'Task 1', userId: user._id, priority: 'high', status: 'Pending' },
        { title: 'Task 2', userId: user._id, priority: 'medium', status: 'Completed' },
        { title: 'Task 3', userId: user._id, priority: 'low', status: 'In Progress' }
      ];

      await Task.insertMany(tasks);
    });

    test('Should get all user tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(3);
      expect(response.body.pagination.total).toBe(3);
    });

    test('Should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks?status=Completed')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].status).toBe('Completed');
    });

    test('Should filter tasks by priority', async () => {
      const response = await request(app)
        .get('/api/tasks?priority=high')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].priority).toBe('high');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      task = new Task({
        title: 'Original Title',
        userId: user._id,
        priority: 'medium',
        status: 'Pending'
      });
      await task.save();
    });

    test('Should update task', async () => {
      const updateData = {
        title: 'Updated Title',
        status: 'Completed'
      };

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.task.title).toBe(updateData.title);
      expect(response.body.task.status).toBe(updateData.status);
    });

    test('Should not update task of another user', async () => {
      const anotherUser = new User({
        username: 'anotheruser',
        email: 'another@example.com',
        password: 'password123'
      });
      await anotherUser.save();

      const anotherToken = jwt.sign({ userId: anotherUser._id }, config.jwt.secret);

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .send({ title: 'Hacked Title' });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      task = new Task({
        title: 'Task to Delete',
        userId: user._id,
        priority: 'medium',
        status: 'Pending'
      });
      await task.save();
    });

    test('Should delete task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });
  });

  describe('GET /api/tasks/stats', () => {
    beforeEach(async () => {
      const tasks = [
        { title: 'Task 1', userId: user._id, priority: 'high', status: 'Pending' },
        { title: 'Task 2', userId: user._id, priority: 'medium', status: 'Completed' },
        { title: 'Task 3', userId: user._id, priority: 'low', status: 'Pending' }
      ];

      await Task.insertMany(tasks);
    });

    test('Should get task statistics', async () => {
      const response = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(3);
      expect(response.body.statusStats).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ _id: 'Pending', count: 2 }),
          expect.objectContaining({ _id: 'Completed', count: 1 })
        ])
      );
    });
  });
});