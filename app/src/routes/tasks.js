const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} = require('../controllers/task.controller');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(auth);

// Validation rules
const taskValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be 1-100 characters'),
    // .unique('Task with this title already exists'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed'])
    .withMessage('Status must be Pending, In Progress, or Completed'),
  body('dueDate')
    .optional()
    .isISO8601()
    .custom(value => {
      if (new Date(value) < new Date()) {
        throw new Error('Due date cannot be in the past');
      }
      return true;
    })
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid task ID')
];

// Routes
router.get('/', getTasks);
router.get('/stats', getTaskStats);
router.get('/:id', idValidation, getTask);
router.post('/', taskValidation, createTask);
router.put('/:id', [...idValidation, ...taskValidation], updateTask);
router.delete('/:id', idValidation, deleteTask);

module.exports = router;