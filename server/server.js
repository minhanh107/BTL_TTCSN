require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { PORT, FRONTEND_URL } = require('./config');
const authRoutes = require('./routes/auth');
const googleRoutes = require('./routes/google');
const passport = require('passport');
require('./utils/init.mongodb');

const app = express();

// Security middleware - Helmet (set security HTTP headers)
app.use(helmet());

// CORS middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

// HTTP request logger - Morgan
// Use 'combined' for production, 'dev' for development
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));

// Body parsing middleware (must be before custom logging)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());


// Serve static files for uploaded images (if needed in future)
// app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api', authRoutes);
app.use('/api', googleRoutes);
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/attributes', require('./routes/attributes'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payment', require('./routes/payments'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/search', require('./routes/search'));
app.use('/api/users', require('./routes/users'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Test endpoint for ngrok
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Ngrok is working!',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
});
