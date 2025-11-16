const mongoose = require('mongoose');


const DOCUMENT_NAME = 'Payment';
const COLLECTION_NAME = 'Payments';

// Chỉ log kết quả thanh toán VNPay (không chứa business logic)
const PaymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:   { type: Number, required: true },

  vnp_TmnCode: String,
  vnp_TxnRef:  { type: String, required: true },
  vnp_OrderInfo: String,
  vnp_Amount: Number,
  vnp_ResponseCode: { type: String, required: true },
  vnp_Message: String,
  vnp_BankCode: String,
  vnp_PayDate: String,
  vnp_TransactionNo: String,
  vnp_TransactionType: String,
  vnp_TransactionStatus: String,
  vnp_BankTranNo: String,
  vnp_CardType: String,

  status: { type: String, required: true, enum: ['success', 'failed', 'pending'], default: 'pending' },
  vnpay_request:  { type: mongoose.Schema.Types.Mixed },
  vnpay_response: { type: mongoose.Schema.Types.Mixed },
  processed_at: { type: Date, default: Date.now }
}, { timestamps: true, collection: COLLECTION_NAME });

PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ vnp_TxnRef: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: -1 });

PaymentSchema.pre('save', function(next) {
  try {
    if (this.vnp_ResponseCode) {
      this.status = this.vnp_ResponseCode === '00' ? 'success' : 'failed';
    }
    next();
  } catch (e) { next(e); }
});

PaymentSchema.virtual('isSuccessful').get(function() {
  return this.status === 'success' && this.vnp_ResponseCode === '00';
});

PaymentSchema.statics.createFromVNPayCallback = function(vnpayData, orderId, userId) {
  return this.create({
    orderId: orderId,
    userId: userId,
    amount: vnpayData.vnp_Amount ? vnpayData.vnp_Amount / 100 : 0,
    vnp_TmnCode: vnpayData.vnp_TmnCode,
    vnp_TxnRef: vnpayData.vnp_TxnRef,
    vnp_OrderInfo: vnpayData.vnp_OrderInfo,
    vnp_Amount: vnpayData.vnp_Amount,
    vnp_ResponseCode: vnpayData.vnp_ResponseCode,
    vnp_Message: vnpayData.vnp_Message,
    vnp_BankCode: vnpayData.vnp_BankCode,
    vnp_PayDate: vnpayData.vnp_PayDate,
    vnp_TransactionNo: vnpayData.vnp_TransactionNo,
    vnp_TransactionType: vnpayData.vnp_TransactionType,
    vnp_TransactionStatus: vnpayData.vnp_TransactionStatus,
    vnp_BankTranNo: vnpayData.vnp_BankTranNo,
    vnp_CardType: vnpayData.vnp_CardType,
    vnpay_response: vnpayData
  });
};

PaymentSchema.statics.findByOrder = function(orderId) {
  return this.find({ orderId: orderId }).sort({ createdAt: -1 });
};


module.exports = mongoose.model(DOCUMENT_NAME, PaymentSchema);
