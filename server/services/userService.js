const User = require('../models/User');
const bcrypt = require('bcrypt');

const userService = {
  async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  },

  async findUserByEmail(email) {
    return await User.findOne({ email });
  },

  async findUserByUsername(username) {
    return await User.findOne({ username });
  },

  async findUserByGoogleId(googleId) {
    return await User.findOne({ googleId });
  },

  async updateUser(email, updates) {
    return await User.findOneAndUpdate(
      { email },
      { $set: updates },
      { new: true }
    );
  },

  async verifyUser(email) {
    return await this.updateUser(email, { verified: true });
  },

  async updatePassword(email, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return await this.updateUser(email, { password: hashedPassword });
  }
};

module.exports = userService;

