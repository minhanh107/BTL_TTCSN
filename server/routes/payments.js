const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');

// VNPay IPN callback (no auth required - VNPay calls this)
// VNPay có thể gửi IPN qua GET hoặc POST
router.get('/vnpay/ipn', paymentController.handleVNPayIPN);
router.post('/vnpay/ipn', paymentController.handleVNPayIPN);

// Get payment by order ID (user and admin)
router.get('/order/:orderId', verifyToken, paymentController.getPaymentByOrder);

// Retry payment for existing order (user and admin)
router.post('/order/:orderId/retry', verifyToken, paymentController.retryPayment);

// Get payment history (user's own history, or all if admin)
router.get('/history', verifyToken, paymentController.getHistories);

module.exports = router;

