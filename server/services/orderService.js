const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const paymentService = require('./paymentService');
const vnpay = require('../utils/init.vnpay');

const orderService = {
  // Create order from cart
  async createOrder(userId, shippingAddress, paymentMethod = 'vnpay', ipAddress) {
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      throw new Error('Giỏ hàng trống');
    }

    const items = [];
    let totalAmount = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.productId;
      const variant = product.variants[cartItem.variantIndex];

      if (!variant) {
        throw new Error(`Variant không tồn tại cho sản phẩm ${product.name}`);
      }

      const itemPrice = variant.price * cartItem.quantity;
      totalAmount += itemPrice;

      items.push({
        productId: product._id,
        productName: product.name,
        variant: {
          volume: variant.volume,
          price: variant.price
        },
        quantity: cartItem.quantity,
        price: itemPrice
      });
    }

    // Determine initial status and payment status based on payment method
    let initialStatus = 'waiting_payment';
    let paymentStatus = 'pending';
    let timelineNote = 'Đơn hàng được tạo - Chờ thanh toán';

    if (paymentMethod === 'cod') {
      initialStatus = 'confirmed';
      paymentStatus = 'pending'; // Will be paid when delivered
      timelineNote = 'Đơn hàng được tạo - Thanh toán khi nhận hàng (COD)';
    }

    const order = new Order({
      userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      status: initialStatus,
      timeline: [{
        status: initialStatus,
        timestamp: new Date(),
        note: timelineNote
      }]
    });

    await order.save();

    // Clear cart
    await Cart.findOneAndUpdate({ userId }, { items: [] });

    // Get populated order
    const populatedOrder = await Order.findById(order._id).populate('userId', 'username email');
    
    // Convert Mongoose object to plain JavaScript object
    const result = populatedOrder.toObject();

    // Only generate payment URL for VNPay
    if (paymentMethod === 'vnpay' && ipAddress) {
      try {
        const paymentUrl = vnpay.buildPaymentUrl({
          vnp_Amount: order.totalAmount,
          vnp_OrderInfo: `Đơn hàng #${order._id}`,
          vnp_TxnRef: order._id,
          vnp_IpAddr: ipAddress,
          vnp_ReturnUrl: `${String(process.env.VNP_RETURN_URL)}/orders/${order._id}`,
        });
        if (!paymentUrl) {
          throw new Error('Không thể tạo link thanh toán VNPay: paymentUrl là null hoặc undefined');
        }
        result.paymentUrl = paymentUrl;
      } catch (err) {
        console.error('Error building payment URL:', err);
        throw new Error('Không thể tạo link thanh toán VNPay: ' + (err.message || err.toString()));
      }
    }

    return result;
  },

  // Get user orders
  // If limit is provided, returns only the most recent orders
  async getUserOrders(userId, isAdmin = false, limit = null) {
    const query = isAdmin ? {} : { userId };
    let orderQuery = Order.find(query)
      .populate('userId', 'username email')
      .populate('items.productId', 'name images')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    if (limit && limit > 0) {
      orderQuery = orderQuery.limit(limit);
    }
    
    return await orderQuery;
  },

  // Get order by ID
  async getOrderById(orderId, userId, isAdmin = false) {
    const query = isAdmin ? { _id: orderId } : { _id: orderId, userId };
    return await Order.findOne(query)
      .populate('userId', 'username email fullName phone')
      .populate('items.productId', 'name images');
  },

  // Update order status
  async updateOrderStatus(orderId, status, note = '') {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Đơn hàng không tồn tại');
    }

    order.status = status;
    order.timeline.push({
      status,
      timestamp: new Date(),
      note
    });

    return await order.save();
  },

  // Get revenue stats (admin only)
  // Handles UTC+7 timezone correctly
  async getRevenueStats(startDate, endDate) {
    const query = {
      status: { $in: ['paid', 'confirmed', 'processing', 'shipping', 'delivered'] },
      createdAt: {}
    };

    // Parse dates with UTC+7 timezone
    if (startDate) {
      // startDate is in YYYY-MM-DD format, parse as UTC+7 00:00:00
      query.createdAt.$gte = new Date(startDate + 'T00:00:00+07:00');
    }
    if (endDate) {
      // endDate is in YYYY-MM-DD format, parse as UTC+7 23:59:59.999
      query.createdAt.$lte = new Date(endDate + 'T23:59:59.999+07:00');
    }

    const orders = await Order.find(query);
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    };
  },

  // Get revenue chart data (admin only) - returns data grouped by date
  // Handles UTC+7 timezone correctly
  async getRevenueChartData(startDate, endDate) {
    const query = {
      status: { $in: ['paid', 'confirmed', 'processing', 'shipping', 'delivered'] },
      createdAt: {}
    };

    // Parse dates with UTC+7 timezone
    if (startDate) {
      // startDate is in YYYY-MM-DD format, parse as UTC+7 00:00:00
      const start = new Date(startDate + 'T00:00:00+07:00');
      query.createdAt.$gte = start;
    }
    if (endDate) {
      // endDate is in YYYY-MM-DD format, parse as UTC+7 23:59:59.999
      const end = new Date(endDate + 'T23:59:59.999+07:00');
      query.createdAt.$lte = end;
    }

    const orders = await Order.find(query).sort({ createdAt: 1 });

    // Helper function to convert UTC date to UTC+7 date string
    const getDateInUTC7 = (date) => {
      // Convert UTC date to UTC+7 by adding 7 hours, then get date string
      const utc7Date = new Date(date.getTime() + 7 * 60 * 60 * 1000);
      return utc7Date.toISOString().split('T')[0]; // YYYY-MM-DD
    };

    // Group orders by date (in UTC+7)
    const dailyData = {};
    orders.forEach(order => {
      // Order createdAt is stored in UTC, convert to UTC+7 for grouping
      const dateKey = getDateInUTC7(order.createdAt);
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          revenue: 0,
          orders: 0
        };
      }
      dailyData[dateKey].revenue += order.totalAmount;
      dailyData[dateKey].orders += 1;
    });

    // Convert to array and fill missing dates with 0
    const result = [];
    if (startDate && endDate) {
      // Parse dates in UTC+7 and iterate day by day
      const start = new Date(startDate + 'T00:00:00+07:00');
      const end = new Date(endDate + 'T23:59:59.999+07:00');
      const current = new Date(start);
      
      while (current <= end) {
        const dateKey = getDateInUTC7(current);
        result.push(dailyData[dateKey] || {
          date: dateKey,
          revenue: 0,
          orders: 0
        });
        current.setDate(current.getDate() + 1);
      }
    } else {
      // If no date range, just return the data we have
      result.push(...Object.values(dailyData));
    }

    return result;
  },

  // Get order stats (success and failed orders)
  // Handles UTC+7 timezone correctly
  async getOrderStats(startDate, endDate) {
    const query = {
      createdAt: {}
    };

    // Parse dates with UTC+7 timezone
    if (startDate) {
      // startDate is in YYYY-MM-DD format, parse as UTC+7 00:00:00
      query.createdAt.$gte = new Date(startDate + 'T00:00:00+07:00');
    }
    if (endDate) {
      // endDate is in YYYY-MM-DD format, parse as UTC+7 23:59:59.999
      query.createdAt.$lte = new Date(endDate + 'T23:59:59.999+07:00');
    }

    const allOrders = await Order.find(query);
    
    const successOrders = allOrders.filter(order => 
      ['paid', 'confirmed', 'processing', 'shipping', 'delivered'].includes(order.status)
    );
    const failedOrders = allOrders.filter(order => 
      order.status === 'cancelled' || order.paymentStatus === 'failed'
    );

    return {
      success: successOrders.length,
      failed: failedOrders.length,
      total: allOrders.length
    };
  },

  // Add timeline entry to order (admin only)
  async addTimeline(orderId, status, note = '') {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Đơn hàng không tồn tại');
    }

    order.timeline.push({
      status,
      timestamp: new Date(),
      note
    });

    // Update order status if provided status is different
    if (status && status !== order.status) {
      order.status = status;
    }

    return await order.save();
  }
};

module.exports = orderService;

