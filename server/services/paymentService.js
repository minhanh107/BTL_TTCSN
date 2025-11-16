const Order = require('../models/Order');
const Payment = require('../models/Payment');
const vnpay = require('../utils/init.vnpay');
const {
  IpnFailChecksum,
  IpnOrderNotFound,
  IpnInvalidAmount,
  InpOrderAlreadyConfirmed,
  IpnUnknownError,
  IpnSuccess,
} = require('vnpay');

const paymentService = {

  /**
   * Handle VNPay IPN callback
   * @param {Object} query - Query parameters from VNPay callback
   * @returns {Object} Response object for VNPay
   */
  async handleIPN({ query }) {
    try {
      const verify = vnpay.verifyIpnCall(query);
      console.log("verify >>>", verify);
      console.log("query >>>", query);
      
      // 1) Check chữ ký & trạng thái callback VNPay
      if (!verify.isVerified) return IpnFailChecksum;

      // 2) Tìm đơn hàng
      const order = await Order.findById(verify.vnp_TxnRef);
      if (!order) return IpnOrderNotFound;

      // 3) So khớp số tiền (Module vnpay đã xử lý * 100, nên so sánh trực tiếp)
      if (Number(verify.vnp_Amount) !== Number(order.totalAmount)) return IpnInvalidAmount;

      // 4) Idempotent: nếu đã paid rồi thì bỏ qua (chỉ khi thành công)
      if (verify.isSuccess && order.paymentStatus === 'paid') return InpOrderAlreadyConfirmed;

      // 5) Xử lý theo kết quả giao dịch
      if (verify.isSuccess) {
        // Giao dịch thành công
        order.status = 'paid';
        order.paymentStatus = 'paid';
        order.timeline.push({
          status: 'paid',
          timestamp: new Date(),
          note: 'Thanh toán thành công qua VNPay'
        });

        // Ghi log thanh toán VNPay
        await Payment.createFromVNPayCallback(query, order._id, order.userId);
        
        // Lưu đơn hàng
        await order.save();

        // Trả response cho VNPay
        return IpnSuccess;
      } else {
        // Giao dịch thất bại/hủy → hủy đơn hàng luôn
        order.paymentStatus = 'failed';
        order.status = 'cancelled'; // Hủy đơn hàng khi thanh toán thất bại
        
        // Thêm timeline entry cho giao dịch thất bại và hủy đơn hàng
        const failureNote = verify.message || 'Giao dịch thanh toán thất bại';
        order.timeline.push({
          status: 'cancelled',
          timestamp: new Date(),
          note: `Đơn hàng đã bị hủy do thanh toán thất bại: ${failureNote}`
        });

        // Ghi log thanh toán thất bại VNPay (nếu cần)
        try {
          await Payment.createFromVNPayCallback(query, order._id, order.userId);
        } catch (err) {
          console.error('Error creating payment record for failed transaction:', err);
        }
        
        // Lưu đơn hàng
        await order.save();

        // Trả response thành công cho VNPay (để VNPay không gửi lại callback)
        // Nhưng với RspCode phù hợp để báo đã nhận được thông báo thất bại
        return IpnSuccess; // VNPay expects success response even for failed transactions
      }
    } catch (error) {
      console.error(`IPN verification error: ${error.message}`);
      return IpnUnknownError;
    }
  },

  /**
   * Get payment history for an order
   * @param {String} orderId - Order ID
   * @returns {Array} Payment records
   */
  async getPaymentByOrder(orderId) {
    return await Payment.findByOrder(orderId);
  },

  /**
   * Get payment history for a user
   * @param {String} userId - User ID
   * @returns {Array} Payment records
   */
  async getPaymentHistory(userId) {
    return await Payment.find({ userId })
      .populate('orderId', 'totalAmount status paymentStatus')
      .sort({ createdAt: -1 });
  },

  /**
   * Get all payment histories (admin only)
   * @returns {Array} All payment records
   */
  async getAllPaymentHistories() {
    return await Payment.find()
      .populate('orderId', 'totalAmount status paymentStatus')
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
  },

  /**
   * Build VNPay payment URL for an order
   * @param {Object} order - Order object from database
   * @param {String} ipAddress - Client IP address
   * @returns {String} Payment URL
   */
  buildPaymentUrl(order, ipAddress) {
    // Validate IP address
    if (!ipAddress || ipAddress === '::1') {
      // Convert IPv6 localhost to IPv4
      if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
        ipAddress = '127.0.0.1';
      }
      // Remove IPv6 prefix if present
      if (ipAddress && ipAddress.startsWith('::ffff:')) {
        ipAddress = ipAddress.replace('::ffff:', '');
      }
    }

    const orderInfo = `Đơn hàng #${order._id.toString()}`;
    const backendUrl = process.env.BACKEND_URL || process.env.VNP_BACKEND_URL || 'http://localhost:3000';
    const ipnUrl = `${backendUrl}/api/payments/vnpay/ipn`;
    
    console.log('Building payment URL with IPN:', ipnUrl);
    console.log('Using IP address:', ipAddress);
    console.log('Order ID:', order._id.toString());
    console.log('Order Amount:', order.totalAmount);
    
    try {
      const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: order.totalAmount, // Module vnpay tự động * 100
        vnp_OrderInfo: orderInfo,
        vnp_TxnRef: order._id.toString(),
        vnp_IpAddr: ipAddress,
        vnp_ReturnUrl: `${process.env.VNP_RETURN_URL || 'http://localhost:5173'}/orders/${order._id}`,
        vnp_IpnUrl: ipnUrl, // IPN callback URL
      });
      
      if (!paymentUrl) {
        throw new Error('VNPay returned null payment URL');
      }
      
      console.log('Payment URL built successfully');
      return paymentUrl;
    } catch (error) {
      console.error('Error building VNPay payment URL:', error);
      throw new Error('Không thể tạo link thanh toán VNPay: ' + (error.message || error.toString()));
    }
  },

  /**
   * Create payment URL for existing order (retry payment)
   * Build payment URL mới từ database thay vì dùng URL cũ
   * Chỉ cho phép retry khi order status là 'waiting_payment'
   * @param {String} orderId - Order ID
   * @param {String} ipAddress - Client IP address
   * @returns {String} Payment URL
   */
  async createPaymentUrlForOrder(orderId, ipAddress) {
    // Lấy order mới nhất từ database để đảm bảo có data mới nhất
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Đơn hàng không tồn tại');
    }
    
    // Chỉ cho phép retry khi order status là 'waiting_payment'
    if (order.status !== 'waiting_payment') {
      if (order.status === 'paid' || order.paymentStatus === 'paid') {
        throw new Error('Đơn hàng đã được thanh toán');
      }
      if (order.status === 'cancelled') {
        throw new Error('Đơn hàng đã bị hủy, không thể thanh toán lại');
      }
      throw new Error(`Đơn hàng ở trạng thái '${order.status}', không thể thanh toán lại. Chỉ có đơn hàng đang chờ thanh toán mới có thể thanh toán lại.`);
    }
    
    // Chỉ cho phép retry nếu payment status là pending hoặc failed (nhưng order chưa bị cancelled)
    if (order.paymentStatus === 'paid') {
      throw new Error('Đơn hàng đã được thanh toán');
    }
    
    // Build payment URL mới từ order data trong database
    // Điều này đảm bảo luôn tạo URL mới với thông tin mới nhất
    console.log('Creating new payment URL for order:', orderId);
    console.log('Order data from DB:', {
      orderId: order._id.toString(),
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      status: order.status
    });
    
    return this.buildPaymentUrl(order, ipAddress);
  }
};

module.exports = paymentService;
