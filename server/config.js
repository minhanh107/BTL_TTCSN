
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SMTP_AUTH_EMAIL = process.env.SMTP_AUTH_EMAIL;
const SMTP_AUTH_PASSWORD_EMAIL = process.env.SMTP_AUTH_PASSWORD_EMAIL;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/[new_app]';

module.exports = {
  JWT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  SMTP_AUTH_EMAIL,
  SMTP_AUTH_PASSWORD_EMAIL,
  FRONTEND_URL,
  PORT,
  BACKEND_URL,
  MONGO_URI
};
