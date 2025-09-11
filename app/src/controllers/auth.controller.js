const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../../../config/app.config');
const { validationResult } = require('express-validator');

const generateToken = (userId) => {
  if (!config.jwt || !config.jwt.secret) {
    const err = new Error('JWT secret is not configured on the server');
    err.status = 500;
    throw err;
  }
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

const register = async (req, res, next) => {
  try {
    console.log('Registration attempt:', { username: req.body.username, email: req.body.email });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Registration validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      console.log('Registration failed - user exists:', { username, email });
      return res.status(400).json({
        error: 'User already exists with this email or username'
      });
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();
    console.log('User registered successfully:', { id: user._id, username: user.username });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message, error.stack);
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    console.log('Login attempt:', { username: req.body.username });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Login validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      console.log('Login failed - user not found:', { username });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      console.log('Login failed - user inactive:', { username, userId: user._id });
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('Login failed - invalid password:', { username, userId: user._id });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful:', { username, userId: user._id });
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    return next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile
};