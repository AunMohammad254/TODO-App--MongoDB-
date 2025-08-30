const request = require('supertest');
const app = require('../../app/src/app');
const User = require('../../app/src/models/user');
const Task = require('../../app/src/models/task');
const jwt = require('jsonwebtoken');
const config = require('../../config/app.config');

let user, token;

beforeEach(async () => {
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