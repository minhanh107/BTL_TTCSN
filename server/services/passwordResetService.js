const PasswordResetToken = require('../models/PasswordResetToken');
const { v4: uuidv4 } = require('uuid');

const passwordResetService = {
  async createResetToken(email) {
    // Delete any existing tokens for this email
    await PasswordResetToken.deleteMany({ email, used: false });

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes expiry

    const resetToken = new PasswordResetToken({
      email,
      token,
      expiresAt
    });

    return await resetToken.save();
  },

  async findResetToken(token) {
    return await PasswordResetToken.findOne({ token });
  },

  async markTokenAsUsed(token) {
    return await PasswordResetToken.findOneAndUpdate(
      { token },
      { $set: { used: true } },
      { new: true }
    );
  },

  async cleanExpiredTokens() {
    // MongoDB TTL index will automatically delete expired documents
    // This method can be used for manual cleanup if needed
    const now = new Date();
    return await PasswordResetToken.deleteMany({ expiresAt: { $lt: now } });
  }
};

module.exports = passwordResetService;

