const OTP = require('../models/OTP');

const otpService = {
  async createOTP(email, code, userId) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    const otp = new OTP({
      email,
      code,
      userId,
      expiresAt
    });

    return await otp.save();
  },

  async findOTP(email, code) {
    return await OTP.findOne({ email, code });
  },

  async deleteOTP(email, code) {
    return await OTP.deleteOne({ email, code });
  },

  async cleanExpiredOTPs() {
    // MongoDB TTL index will automatically delete expired documents
    // This method can be used for manual cleanup if needed
    const now = new Date();
    return await OTP.deleteMany({ expiresAt: { $lt: now } });
  }
};

module.exports = otpService;

