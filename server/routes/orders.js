const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');

// User routes
router.get('/', verifyToken, orderController.getOrders);
router.post('/', verifyToken, orderController.createOrder);

// Stats routes - must be before /:id route to avoid conflicts
router.get('/stats/revenue/chart', verifyToken, requireAdmin, orderController.getRevenueChartData);
router.get('/stats/revenue', verifyToken, requireAdmin, orderController.getRevenueStats);
router.get('/stats/orders', verifyToken, requireAdmin, orderController.getOrderStats);

// Order by ID routes (must be after stats routes)
router.get('/:id', verifyToken, orderController.getOrderById);
router.put('/:id/status', verifyToken, requireAdmin, orderController.updateOrderStatus);
router.post('/:id/timeline', verifyToken, requireAdmin, orderController.addTimeline);

module.exports = router;

