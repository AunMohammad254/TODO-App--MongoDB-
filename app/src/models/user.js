const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../../../config/app.config');

const userSchema = new mongoose.Schema({
username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^[A-Za-z0-9]+([.-][A-Za-z0-9]+)*@[A-Za-z0-9]+([.-][A-Za-z0-9]+)*(\.[A-Za-z]{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
},{  
    timestamps: true,
    collection: 'users' // Explicit collection name for MongoDB Compass
});

// Indexes for better performance and MongoDB Compass visibility
// Note: username and email unique indexes are handled by schema unique: true
userSchema.index({ createdAt: -1 }, { name: 'user_created_at_desc' });
userSchema.index({ isActive: 1, createdAt: -1 }, { name: 'user_active_by_date' });
userSchema.index({ 
  username: 'text', 
  email: 'text' 
}, { 
  name: 'user_text_search_idx',
  weights: { username: 10, email: 5 }
});

// Hash password before saving to database
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Export User model
module.exports = mongoose.model('User', userSchema);
