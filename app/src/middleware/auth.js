const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../../../config/app.config');

const auth = async (req, res, next) => {
  try {
    // Ensure JWT secret is configured
    if (!config.jwt || !config.jwt.secret) {
      const err = new Error('JWT secret is not configured on the server');
      err.status = 500;
      throw err;
    }

    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access Denied. No token provided' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive.' });
    }
    
    req.user = user;
    req.token = token;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = auth;