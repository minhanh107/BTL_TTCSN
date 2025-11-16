const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Register new user
router.post('/register', authController.register);

// Verify OTP
router.post('/verify-otp', authController.verifyOTP);

// Resend OTP
router.post('/resend-otp', authController.resendOTP);

// Login
router.post('/login', authController.login);

// Verify token
router.get('/verify-token', authController.verifyToken);

// Forgot password
router.post('/forgot-password', authController.forgotPassword);

// Reset password
router.post('/reset-password', authController.resetPassword);

module.exports = router;
