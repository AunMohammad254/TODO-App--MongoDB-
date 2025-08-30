require("dotenv").config({
  path: "./.env",
});

module.exports = {
  port: process.env.PORT || 3000,
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb+srv://aunmohammad254_db_user:DZtAQGMkmnctzd1S@cluster0.xxothym.mongodb.net/todoapp?retryWrites=true&w=majority&authSource=admin',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT) || 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      w: 'majority',
      authSource: 'admin',
      tls: true,
      tlsAllowInvalidCertificates: false,
      heartbeatFrequencyMS: 10000, // How often to check the server status
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      connectTimeoutMS: 10000 // Give up initial connection after 10 seconds
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || '321f607f5603f41e94b4b7b9dbd315cd67f512ec623a3ba0d5f4ae5ba143db4b',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
  },
  security: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    lockoutTime: parseInt(process.env.LOCKOUT_TIME) || 15, // minutes
  },
  env: process.env.NODE_ENV || 'development'
};