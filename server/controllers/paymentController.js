const paymentService = require('../services/paymentService');

/**
 * PaymentController - API endpoints cho payment và VNPay
 */
const paymentController = {
  /**
   * POST /api/payments/vnpay/ipn
   * VNPay IPN callback handler
   */
  async handleVNPayIPN(req, res) {
    // Log để debug
    console.log('=== VNPay IPN Callback Received ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Query:', req.query);
    console.log('Body:', req.body);
    console.log('Headers:', {
      'user-agent': req.headers['user-agent'],
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'content-type': req.headers['content-type']
    });
    
    try {
      // VNPay có thể gửi data qua query string (GET) hoặc body (POST)
      const queryData = Object.keys(req.query).length > 0 ? req.query : req.body;
      
      if (!queryData || Object.keys(queryData).length === 0) {
        console.error('IPN: No data received');
        return res.status(400).json({ error: 'No data received' });
      }
      
      console.log('Processing IPN with data:', queryData);
      const result = await paymentService.handleIPN({ query: queryData });
      
      console.log('IPN Result:', result);
      return res.json(result);
    } catch (error) {
      console.error('IPN handler error:', error);
      console.error('Error stack:', error.stack);
      return res.status(500).json({ error: 'Lỗi xử lý IPN', message: error.message });
    }
  },

  /**
   * GET /api/payments/order/:orderId
   * Lấy thông tin thanh toán theo order ID
   * Sử dụng cho cả 2 role
   */
  async getPaymentByOrder(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;
      
      // Verify order belongs to user (unless admin)
      const User = require('../models/User');
      const user = await User.findById(userId);
      const isAdmin = user && user.role === 'admin';
      
      const Order = require('../models/Order');
      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
      }
      
      if (!isAdmin && order.userId.toString() !== userId) {
        return res.status(403).json({ error: 'Không có quyền truy cập' });
      }
      
      const result = await paymentService.getPaymentByOrder(orderId);
      return res.json(result);
    } catch (error) {
      console.error('Get payment by order error:', error);
      return res.status(500).json({ error: error.message });
    }
  },

  /**
   * GET /api/payments/history
   * Lấy lịch sử thanh toán của user
   */
  async getHistories(req, res) {
    try {
      const userId = req.user.id;
      
      // Check if admin
      const User = require('../models/User');
      const user = await User.findById(userId);
      const isAdmin = user && user.role === 'admin';
      
      let result;
      if (isAdmin) {
        result = await paymentService.getAllPaymentHistories();
      } else {
        result = await paymentService.getPaymentHistory(userId);
      }
      
      return res.json(result);
    } catch (error) {
      console.error('Get payment histories error:', error);
      return res.status(500).json({ error: error.message });
    }
  },

  /**
   * POST /api/payments/order/:orderId/retry
   * Tạo lại payment URL cho đơn hàng chưa thanh toán
   */
  async retryPayment(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;
      
      // Verify order belongs to user (unless admin)
      const User = require('../models/User');
      const user = await User.findById(userId);
      const isAdmin = user && user.role === 'admin';
      
      const Order = require('../models/Order');
      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
      }
      
      if (!isAdmin && order.userId.toString() !== userId) {
        return res.status(403).json({ error: 'Không có quyền truy cập' });
      }
      
      // Get client IP address
      const forwardedFor = req.headers['x-forwarded-for'];
      const ipAddress = req.ip || 
        (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || 
        req.connection.remoteAddress || 
        '127.0.0.1';
      
      const paymentUrl = await paymentService.createPaymentUrlForOrder(orderId, ipAddress);
      
      return res.json({ paymentUrl });
    } catch (error) {
      console.error('Retry payment error:', error);
      return res.status(400).json({ error: error.message });
    }
  }
};

module.exports = paymentController;
