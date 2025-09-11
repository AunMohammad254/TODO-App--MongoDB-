const express = require('express');
const { body } = require('express-validator');
const { register, login, getProfile } = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, underscores, dots, and hyphens'),
  body('email')
    .isEmail({ allow_utf8_local_part: true })
    .normalizeEmail({ gmail_remove_dots: false })
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters long')
];

const loginValidation = [
  body('username').notEmpty().withMessage('Username or email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, (req, res, next) => register(req, res, next));
router.post('/login', loginValidation, (req, res, next) => login(req, res, next));
router.get('/profile', auth, (req, res, next) => getProfile(req, res, next));

module.exports = router;