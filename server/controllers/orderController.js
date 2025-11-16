const orderService = require('../services/orderService');
const User = require('../models/User');

const orderController = {
  // Get orders
  async getOrders(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      const isAdmin = user && user.role === 'admin';
      
      // Get limit from query parameter (for dashboard to get recent orders)
      const limit = req.query.limit ? parseInt(req.query.limit) : null;

      const orders = await orderService.getUserOrders(userId, isAdmin, limit);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get order by ID
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const user = await User.findById(userId);
      const isAdmin = user && user.role === 'admin';

      const order = await orderService.getOrderById(id, userId, isAdmin);
      if (!order) {
        return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create order
  async createOrder(req, res) {
    try {
      const userId = req.user.id;
      const { shippingAddress, paymentMethod = 'vnpay' } = req.body;

      if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
        return res.status(400).json({ error: 'Thiếu thông tin địa chỉ giao hàng' });
      }

      // Validate payment method
      if (!['vnpay', 'cod'].includes(paymentMethod)) {
        return res.status(400).json({ error: 'Phương thức thanh toán không hợp lệ' });
      }
      // Get client IP address (only needed for VNPay)
      let ipAddress = null;
      if (paymentMethod === 'vnpay') {
        // Allow override IP address via environment variable for testing
        ipAddress =
          req.headers["x-forwarded-for"] ||
          req.connection.remoteAddress ||
          req.socket.remoteAddress ||
          req.connection.socket.remoteAddress;
      }
      console.log('ipAddress >>>', ipAddress);

      const order = await orderService.createOrder(userId, shippingAddress, paymentMethod, ipAddress);

      // Ensure response has all required fields
      if (!order) {
        return res.status(500).json({ error: 'Không thể tạo đơn hàng' });
      }

      // Log order for debugging
      console.log('Order created successfully:', {
        orderId: order._id,
        paymentMethod: order.paymentMethod,
        hasPaymentUrl: !!order.paymentUrl
      });

      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(400).json({ error: error.message || 'Lỗi tạo đơn hàng' });
    }
  },

  // Update order status
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Thiếu trạng thái' });
      }

      const order = await orderService.updateOrderStatus(id, status, note);
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get revenue stats
  async getRevenueStats(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const stats = await orderService.getRevenueStats(startDate, endDate);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get revenue chart data
  async getRevenueChartData(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const chartData = await orderService.getRevenueChartData(startDate, endDate);
      res.json(chartData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get order stats (success and failed)
  async getOrderStats(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const stats = await orderService.getOrderStats(startDate, endDate);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Add timeline entry (admin only)
  async addTimeline(req, res) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Thiếu trạng thái' });
      }

      const order = await orderService.addTimeline(id, status, note);
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = orderController;

