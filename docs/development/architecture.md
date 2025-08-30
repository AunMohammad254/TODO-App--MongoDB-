# TODO App Architecture Overview

## Core Components

### Root Files
- **package.json**: Manages dependencies and scripts for development/production
- **main.js**: Electron entry point with security-hardened window management
- **README.md**: Project documentation and setup guide

### Configuration
- **config/config.js**: Central configuration for database, JWT, and security settings
- **.env.example**: Environment variable templates and secure config storage

### Server
- **src/server.js**: HTTP server with lifecycle management
- **src/app.js**: Express app setup with security middleware and routing

### Data Layer
- **src/models/**
  - **user.js**: User schema with authentication
  - **task.js**: Task schema with validation
- **src/utils/**
  - **database.js**: MongoDB connection handler
  - **initializeDatabase.js**: Database setup and seeding

### Business Logic
- **src/controllers/**
  - **authController.js**: Authentication logic
  - **taskController.js**: Task management operations

### Middleware
- **src/middleware/**
  - **auth.js**: JWT authentication
  - **errorHandler.js**: Error processing
  - **validation.js**: Input validation

### Routes
- **src/routes/**
  - **auth.js**: Authentication endpoints
  - **tasks.js**: Task management API

### Frontend
- **public/**
  - **index.html**: SPA structure with CSP
  - **js/app.js**: Frontend logic and state
  - **css/style.css**: Responsive styling

### Testing
- **tests/**
  - **auth.test.js**: Authentication tests
  - **tasks.test.js**: Task operation tests
  - **setup.js**: Test environment config
- **jest.config.js**: Test framework settings

### Deployment
- **scripts/**: Build and deployment automation
- **release/**: Production packages

## Architecture Highlights

### Security
- JWT authentication
- Input validation
- Content Security Policy
- Secure Electron configuration

### Database
- Optimized indexing
- Data isolation
- Connection pooling

### Design Patterns
- Modular architecture
- Component separation
- Cross-platform support

### Developer Tools
- Hot reloading
- Automated testing
- Documentation
