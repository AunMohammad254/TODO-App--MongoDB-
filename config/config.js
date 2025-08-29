require("dotenv").config({
  path: "./.env",
});

module.exports = {
  port: process.env.PORT || 3000,
  mongoURI: process.env.MONGO_URI || 'mongodb+srv://aunmohammad254_db_user:DZtAQGMkmnctzd1S@cluster0.xxothym.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey',
};