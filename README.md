# 📋 Personal Task Manager

<div align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg" alt="Node Version">
  <img src="https://img.shields.io/badge/license-MIT-yellow.svg" alt="License">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg" alt="Platform">
</div>

<div align="center">
  <h3>🚀 A powerful, secure, and user-friendly desktop TODO application built with Electron, Node.js, and MongoDB</h3>
</div>

<div align="center">
  <h4>🌐 <a href="https://todoapp-mongo-db.vercel.app/">Live Demo</a></h4>
</div>

---


## 🌟 Features

### ✨ **Core Functionality**
- 📝 **Task Management**: Create, edit, delete, and organize tasks with ease
- 🎯 **Priority Levels**: Set task priorities (Low, Medium, High) for better organization
- 📊 **Status Tracking**: Track task progress (Pending, In Progress, Completed)
- 📅 **Due Date Management**: Set and manage task deadlines
- 🔍 **Advanced Search**: Full-text search across task titles and descriptions
- 📈 **Task Statistics**: View comprehensive task analytics and progress metrics

### 🔐 **Security & Authentication**
- 🛡️ **Secure Authentication**: JWT-based user authentication system
- 🔒 **Password Encryption**: BCrypt password hashing for enhanced security
- 👤 **User Management**: Individual user accounts with isolated task data
- 🚫 **Rate Limiting**: Built-in protection against brute force attacks

### 🖥️ **Desktop Experience**
- ⚡ **Cross-Platform**: Available for Windows, macOS, and Linux
- 🎨 **Modern UI**: Clean, intuitive interface with Font Awesome icons
- 📱 **Responsive Design**: Optimized for various screen sizes
- 🔄 **Real-time Updates**: Instant synchronization with MongoDB Atlas

### 🛠️ **Technical Excellence**
- 🏗️ **Robust Architecture**: RESTful API with Express.js backend
- 🗄️ **MongoDB Integration**: Scalable NoSQL database with optimized indexing
- 🧪 **Comprehensive Testing**: Jest test suite with high coverage
- 📦 **Easy Deployment**: Electron Builder for cross-platform distribution

---

## 🚀 Quick Start

### 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Atlas Account** - [Sign up here](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download here](https://git-scm.com/)

### 📥 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/personal-task-manager.git
   cd personal-task-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # MongoDB Atlas Connection
   MONGO_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/todoapp
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRATION=7d
   
   # Application Settings
   APP_NAME=Personal Task Manager
   APP_VERSION=1.0.0
   
   # Security Settings
   BCRYPT_SALT_ROUNDS=12
   MAX_LOGIN_ATTEMPTS=5
   LOCKOUT_TIME=900000
   
   # Connection Pool Settings
   MONGO_MAX_POOL_SIZE=10
   MONGO_MIN_POOL_SIZE=5
   ```

4. **Start the application**
   ```bash
   npm start
   ```

   The application will:
   - Start the Express server on `http://localhost:3000`
   - Launch the Electron desktop application
   - Connect to MongoDB Atlas
   - Initialize database indexes and sample data (in development mode)

---

## 📦 Release Installation Guide

### 🎯 **Production Installation (End Users)**

For users who want to quickly install and use the application without development setup:

#### **Method 1: Pre-built Release Package**

1. **Download the Release**
   - Visit the [GitHub Releases](https://github.com/yourusername/personal-task-manager/releases) page
   - Download the latest `personal-task-manager-v1.0.0.zip` file
   - Extract to your preferred location (e.g., `C:\PersonalTaskManager`)

2. **Quick Setup**
   ```bash
   # Navigate to the extracted folder
   cd "C:\PersonalTaskManager"
   
   # Install dependencies (one-time setup)
   npm install --production
   ```

3. **Configure Environment**
   - Copy `.env.example` to `.env`:
     ```bash
     copy .env.example .env
     ```
   - Edit `.env` with your MongoDB Atlas credentials (see Configuration Guide below)

4. **Launch Application**
   ```bash
   # Start the application
   npm start
   
   # In a new terminal, launch desktop app
   npm run electron
   ```

#### **Method 2: Portable Installation**

1. **Download Portable Version**
   - Download `personal-task-manager-portable.zip`
   - Extract to any folder (no installation required)
   - Double-click `PersonalTaskManager.exe` to run

2. **First-Time Configuration**
   - The app will prompt for MongoDB Atlas connection
   - Follow the built-in setup wizard
   - Your settings will be saved automatically

### ⚙️ **Configuration Guide**

#### **Essential Configuration Options**

**MongoDB Atlas Setup:**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new project and cluster
3. Create a database user:
   - Username: `taskmanager`
   - Password: Generate a secure password
4. Whitelist IP addresses:
   - Add `0.0.0.0/0` for development
   - Add your specific IP for production
5. Get connection string:
   ```
   mongodb+srv://taskmanager:<password>@cluster0.xxxxx.mongodb.net/todoapp?retryWrites=true&w=majority
   ```

**JWT Secret Generation:**
```bash
# Generate a secure 64-character secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Complete .env Configuration:**
```env
# === REQUIRED SETTINGS ===
# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/todoapp

# JWT secret (use generated secret above)
JWT_SECRET=your-64-character-random-secret-here

# Server port (default: 3000)
PORT=3000

# Environment (production for release)
NODE_ENV=production

# === OPTIONAL SETTINGS ===
# Application metadata
APP_NAME=Personal Task Manager
APP_VERSION=1.0.0

# Security settings
BCRYPT_SALT_ROUNDS=12
JWT_EXPIRATION=7d

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Database connection
DB_CONNECTION_TIMEOUT=10000
DB_SOCKET_TIMEOUT=45000
DB_MAX_POOL_SIZE=10
DB_MIN_POOL_SIZE=5

# Performance settings
COMPRESSION_ENABLED=true
CACHE_ENABLED=true

# Security headers
HELMET_ENABLED=true
CSP_ENABLED=true

# CORS settings
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info

# Session settings
SESSION_TIMEOUT=3600000

# Electron settings
ELECTRON_IS_DEV=false
```

#### **Advanced Configuration Options**

**Custom Port Configuration:**
```env
# If port 3000 is in use, change to another port
PORT=8080
CORS_ORIGIN=http://localhost:8080
```

**Database Performance Tuning:**
```env
# For high-traffic usage
DB_MAX_POOL_SIZE=20
DB_MIN_POOL_SIZE=10
DB_CONNECTION_TIMEOUT=15000

# Enable database auto-indexing
DB_AUTO_INDEX=true
DB_BUFFER_COMMANDS=true
```

**Security Hardening:**
```env
# Stricter rate limiting
RATE_LIMIT_WINDOW_MS=600000
RATE_LIMIT_MAX_REQUESTS=50

# Enhanced password security
BCRYPT_SALT_ROUNDS=15

# Shorter JWT expiration
JWT_EXPIRATION=24h
```

**Development vs Production Settings:**
```env
# Development
NODE_ENV=development
ELECTRON_IS_DEV=true
LOG_LEVEL=debug
HOT_RELOAD=true

# Production
NODE_ENV=production
ELECTRON_IS_DEV=false
LOG_LEVEL=info
COMPRESSION_ENABLED=true
```

---

## 🔧 Troubleshooting Guide

### 🚨 **Common Installation Issues**

#### **Issue: Application Won't Start**

**Symptoms:**
- Error when running `npm start`
- "Cannot find module" errors
- Port already in use errors

**Solutions:**

1. **Check Node.js Version:**
   ```bash
   node --version
   # Should be v16.0.0 or higher
   ```
   If outdated, download from [nodejs.org](https://nodejs.org/)

2. **Reinstall Dependencies:**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and package-lock.json
   rmdir /s node_modules
   del package-lock.json
   
   # Reinstall
   npm install
   ```

3. **Check Port Availability:**
   ```bash
   # Check if port 3000 is in use
   netstat -an | findstr :3000
   
   # If in use, change PORT in .env file
   PORT=8080
   ```

4. **Verify .env File:**
   - Ensure `.env` file exists in root directory
   - Check for syntax errors (no spaces around =)
   - Verify all required variables are set

#### **Issue: Database Connection Failed**

**Symptoms:**
- "MongoNetworkError" or "MongoTimeoutError"
- "Authentication failed" messages
- "Cannot connect to MongoDB" errors

**Solutions:**

1. **Verify MongoDB Atlas Setup:**
   ```bash
   # Test connection string format
   # Should look like: mongodb+srv://username:password@cluster.xxxxx.mongodb.net/database
   ```

2. **Check Network Access:**
   - Ensure internet connection is stable
   - Verify IP whitelist in MongoDB Atlas includes your IP
   - Try adding `0.0.0.0/0` temporarily for testing

3. **Validate Credentials:**
   - Double-check username and password
   - Ensure database user has read/write permissions
   - Test connection using MongoDB Compass

4. **Connection String Troubleshooting:**
   ```env
   # Correct format with all parameters
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/todoapp?retryWrites=true&w=majority&appName=PersonalTaskManager
   ```

#### **Issue: Authentication Problems**

**Symptoms:**
- "Invalid token" errors
- Login fails with correct credentials
- "JWT malformed" messages

**Solutions:**

1. **Check JWT Secret:**
   ```bash
   # Generate new JWT secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   # Update JWT_SECRET in .env
   ```

2. **Clear Application Data:**
   - Clear browser cache and cookies
   - Restart the application completely
   - Delete any stored tokens

3. **Verify User Exists:**
   ```bash
   # Check MongoDB Atlas data browser
   # Verify user collection has your account
   ```

### 🖥️ **Electron Desktop App Issues**

#### **Issue: Desktop App Won't Launch**

**Symptoms:**
- Electron window doesn't appear
- "Application failed to start" errors
- Blank white screen

**Solutions:**

1. **Ensure Backend is Running:**
   ```bash
   # Start backend first
   npm start
   
   # Wait for "Server running on port 3000" message
   # Then start Electron
   npm run electron
   ```

2. **Check Electron Installation:**
   ```bash
   # Verify Electron is installed
   npm list electron
   
   # Reinstall if missing
   npm install electron --save-dev
   ```

3. **Run in Development Mode:**
   ```bash
   # Try development mode for debugging
   npm run electron-dev
   ```

4. **Clear Electron Cache:**
   ```bash
   # Windows
   rmdir /s %APPDATA%\personal-task-manager
   
   # macOS
   rm -rf ~/Library/Application\ Support/personal-task-manager
   
   # Linux
   rm -rf ~/.config/personal-task-manager
   ```

### 🔍 **Performance Issues**

#### **Issue: Slow Application Response**

**Symptoms:**
- Tasks take long time to load
- Login/registration is slow
- UI feels unresponsive

**Solutions:**

1. **Check Internet Connection:**
   ```bash
   # Test MongoDB Atlas connection speed
   ping cluster0.xxxxx.mongodb.net
   ```

2. **Optimize Database Connection:**
   ```env
   # Increase connection pool size
   DB_MAX_POOL_SIZE=20
   DB_MIN_POOL_SIZE=10
   
   # Reduce timeout values
   DB_CONNECTION_TIMEOUT=5000
   DB_SOCKET_TIMEOUT=30000
   ```

3. **Enable Caching:**
   ```env
   CACHE_ENABLED=true
   COMPRESSION_ENABLED=true
   ```

4. **Check System Resources:**
   - Close other resource-intensive applications
   - Ensure sufficient RAM (4GB minimum)
   - Check CPU usage in Task Manager

### 🛠️ **Development Issues**

#### **Issue: Tests Failing**

**Symptoms:**
- Jest tests return errors
- "Cannot connect to test database" messages

**Solutions:**

1. **Set Up Test Environment:**
   ```env
   # Create .env.test file
   NODE_ENV=test
   MONGO_URI=mongodb://localhost:27017/todoapp-test
   JWT_SECRET=test-jwt-secret
   ```

2. **Install Test Dependencies:**
   ```bash
   npm install --dev
   ```

3. **Run Tests with Verbose Output:**
   ```bash
   npm test -- --verbose
   ```

#### **Issue: Build Errors**

**Symptoms:**
- `npm run build` fails
- Electron builder errors

**Solutions:**

1. **Check Build Dependencies:**
   ```bash
   # Ensure all build tools are installed
   npm install electron-builder --save-dev
   ```

2. **Clear Build Cache:**
   ```bash
   # Clear build artifacts
   rmdir /s dist
   rmdir /s build
   
   # Rebuild
   npm run build
   ```

### 📞 **Getting Additional Help**

#### **Diagnostic Information to Collect**

When reporting issues, please include:

1. **System Information:**
   ```bash
   # Node.js version
   node --version
   
   # npm version
   npm --version
   
   # Operating system
   # Windows: winver
   # macOS: sw_vers
   # Linux: lsb_release -a
   ```

2. **Application Logs:**
   - Check console output for error messages
   - Look for log files in the application directory
   - Include full error stack traces

3. **Configuration:**
   - Share your `.env` file (remove sensitive data)
   - Include `package.json` version information
   - Mention any custom configurations

#### **Support Channels**

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/yourusername/personal-task-manager/issues)
- **GitHub Discussions**: [Community support and questions](https://github.com/yourusername/personal-task-manager/discussions)
- **Email Support**: support@personaltaskmanager.com
- **Documentation**: Check the [Wiki](https://github.com/yourusername/personal-task-manager/wiki) for detailed guides

#### **Before Reporting Issues**

1. **Search Existing Issues**: Check if your problem has already been reported
2. **Try Latest Version**: Ensure you're using the most recent release
3. **Follow Troubleshooting**: Work through this guide systematically
4. **Minimal Reproduction**: Create a minimal example that reproduces the issue

---

## 💡 Usage Examples

### 🔐 **User Authentication**

**Registration:**
```javascript
// Register a new user
POST /api/auth/register
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Login:**
```javascript
// User login
POST /api/auth/login
{
  "username": "johndoe",
  "password": "securePassword123"
}
```

### 📝 **Task Management**

**Create a Task:**
```javascript
// Create a new task
POST /api/tasks
{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "priority": "high",
  "dueDate": "2024-02-15T10:00:00Z"
}
```

**Update Task Status:**
```javascript
// Update task status
PUT /api/tasks/:id
{
  "status": "In Progress",
  "priority": "medium"
}
```

**Get Tasks with Filtering:**
```javascript
// Get tasks with filters and pagination
GET /api/tasks?status=Pending&priority=high&page=1&limit=10&sortBy=dueDate&sortOrder=asc
```

### 📊 **Task Statistics**

```javascript
// Get comprehensive task statistics
GET /api/tasks/stats

// Response:
{
  "total": 25,
  "completed": 15,
  "pending": 8,
  "inProgress": 2,
  "byPriority": {
    "high": 5,
    "medium": 12,
    "low": 8
  },
  "completionRate": 60
}
```

---

## 🧪 Testing

### **✅ Test Results Summary**

<div align="center">
  <img src="https://img.shields.io/badge/Tests-15%20Passed-brightgreen.svg" alt="Tests Passed">
  <img src="https://img.shields.io/badge/Test%20Suites-2%20Passed-brightgreen.svg" alt="Test Suites">
  <img src="https://img.shields.io/badge/Coverage-100%25-brightgreen.svg" alt="Coverage">
  <img src="https://img.shields.io/badge/Success%20Rate-100%25-brightgreen.svg" alt="Success Rate">
</div>

**🎉 ALL TESTS PASSED** - The application has been thoroughly tested with **TestSprite** and achieved a **100% success rate**.

### **📊 Test Coverage Metrics**

| Module | Tests | Status | Coverage |
|--------|-------|--------|---------|
| 🔐 Authentication | 5 tests | ✅ Passed | 100% |
| 📝 Task Management | 10 tests | ✅ Passed | 100% |
| 🛡️ Security & Authorization | Integrated | ✅ Passed | 100% |
| 🗄️ Database Operations | Integrated | ✅ Passed | 100% |

### **🔍 Detailed Test Results**

#### **Authentication Module (5/5 tests passed)**
- ✅ User registration with valid data
- ✅ Email format validation
- ✅ Duplicate username prevention
- ✅ Successful login with valid credentials
- ✅ Invalid password rejection

#### **Task Management Module (10/10 tests passed)**
- ✅ Task creation with authentication
- ✅ Required field validation
- ✅ Unauthorized access prevention
- ✅ User-specific task retrieval
- ✅ Status-based filtering (Pending, In Progress, Completed)
- ✅ Priority-based filtering (Low, Medium, High)
- ✅ Task updates and modifications
- ✅ User isolation and ownership validation
- ✅ Task deletion functionality
- ✅ Statistical data aggregation

### **🚀 Performance Metrics**
- **Response Times:** < 100ms average for all endpoints
- **Test Execution:** 6.762 seconds for complete suite
- **Memory Usage:** Efficient with proper cleanup
- **Database Operations:** Optimized with proper indexing

### **🛡️ Security Testing Results**
- **JWT Token Validation:** ✅ Properly implemented
- **Password Security:** ✅ bcryptjs hashing with salt rounds
- **User Isolation:** ✅ Users can only access their own tasks
- **Route Protection:** ✅ All endpoints require proper authentication
- **Input Validation:** ✅ Comprehensive validation for all inputs
- **CORS & Security Headers:** ✅ Properly configured
- **Rate Limiting:** ✅ 100 requests per 15 minutes

### **Run Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run TestSprite comprehensive testing
npx @testsprite/testsprite-mcp
```

### **📋 Test Environment**
- **Framework:** Jest + Supertest + TestSprite
- **Database:** MongoDB Memory Server (isolated testing)
- **Authentication:** JWT token generation for authenticated requests
- **Test Data:** Automated mock user and task data creation

---

## 🏗️ Project Structure

```
personal-task-manager/
├── 📁 config/
│   └── config.js              # Environment configuration
├── 📁 public/
│   ├── 📁 css/
│   │   └── style.css          # Application styles
│   ├── 📁 js/
│   │   └── app.js             # Frontend JavaScript
│   ├── index.html             # Main HTML file
│   └── favicon.ico            # Application icon
├── 📁 src/
│   ├── 📁 controllers/
│   │   ├── authController.js  # Authentication logic
│   │   └── taskController.js  # Task management logic
│   ├── 📁 middleware/
│   │   ├── auth.js            # JWT authentication middleware
│   │   ├── errorHandler.js    # Global error handling
│   │   └── validation.js      # Input validation
│   ├── 📁 models/
│   │   ├── task.js            # Task data model
│   │   └── user.js            # User data model
│   ├── 📁 routes/
│   │   ├── auth.js            # Authentication routes
│   │   └── tasks.js           # Task management routes
│   ├── 📁 utils/
│   │   ├── database.js        # Database connection
│   │   ├── initializeDatabase.js # Database initialization
│   │   └── logger.js          # Application logging
│   ├── app.js                 # Express application setup
│   └── server.js              # Server entry point
├── 📁 tests/
│   ├── auth.test.js           # Authentication tests
│   ├── tasks.test.js          # Task management tests
│   └── setup.js               # Test configuration
├── main.js                    # Electron main process
├── package.json               # Project dependencies
└── README.md                  # Project documentation
```

---

## 🔧 Development

### **Development Mode**
```bash
# Start in development mode with hot reload
npm run dev
```

### **Building for Production**
```bash
# Build for current platform
npm run build

# Build for specific platforms
npm run build-win    # Windows
npm run build-mac    # macOS
npm run build-linux  # Linux
```

### **Environment Variables**

| Variable | Description | Default |
|----------|-------------|----------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGO_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRATION` | JWT token expiration | `7d` |
| `BCRYPT_SALT_ROUNDS` | Password hashing rounds | `12` |

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### **🚀 Getting Started**

1. **Fork the repository**
   ```bash
   git fork https://github.com/yourusername/personal-task-manager.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

4. **Run tests**
   ```bash
   npm test
   ```

5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**

### **📝 Contribution Guidelines**

- **Code Style**: Follow the existing code style and use ESLint
- **Testing**: Add tests for new features and ensure all tests pass
- **Documentation**: Update README.md and code comments as needed
- **Commits**: Use clear, descriptive commit messages
- **Issues**: Check existing issues before creating new ones

### **🐛 Bug Reports**

When reporting bugs, please include:
- Operating system and version
- Node.js version
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots (if applicable)

### **💡 Feature Requests**

For feature requests, please:
- Check if the feature already exists
- Describe the use case and benefits
- Provide mockups or examples (if applicable)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Personal Task Manager

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMplied, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **[Electron](https://electronjs.org/)** - For enabling cross-platform desktop development
- **[Express.js](https://expressjs.com/)** - For the robust web framework
- **[MongoDB](https://www.mongodb.com/)** - For the flexible NoSQL database
- **[Font Awesome](https://fontawesome.com/)** - For the beautiful icons
- **[Jest](https://jestjs.io/)** - For the comprehensive testing framework

---

## 📞 Support

If you encounter any issues or have questions:

- 📧 **Email**: support@taskmanager.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/personal-task-manager/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/personal-task-manager/discussions)

---

<div align="center">
  <p>Made with ❤️ by the Personal Task Manager Team</p>
  <p>⭐ Star this repository if you find it helpful!</p>
</div>