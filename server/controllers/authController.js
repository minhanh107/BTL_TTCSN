const authService = require('../services/authService');

const authController = {
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error('Registration error:', error);
      const status = error.status || 500;
      const errorMessage = error.error || error.errors || 'Lỗi server khi đăng ký';
      res.status(status).json(error.errors ? { errors: error.errors } : { error: errorMessage });
    }
  },

  async verifyOTP(req, res) {
    try {
      const result = await authService.verifyOTP(req.body);
      res.json(result);
    } catch (error) {
      console.error('OTP verification error:', error);
      const status = error.status || 500;
      const errorMessage = error.error || 'Lỗi server khi xác thực OTP';
      res.status(status).json({ error: errorMessage });
    }
  },

  async resendOTP(req, res) {
    try {
      const result = await authService.resendOTP(req.body);
      res.json(result);
    } catch (error) {
      console.error('Resend OTP error:', error);
      const status = error.status || 500;
      const errorMessage = error.error || 'Lỗi server khi gửi lại OTP';
      res.status(status).json({ error: errorMessage });
    }
  },

  async login(req, res) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (error) {
      console.error('Login error:', error);
      const status = error.status || 500;
      const errorMessage = error.error || error.errors || 'Lỗi server khi đăng nhập';
      res.status(status).json(error.errors ? { errors: error.errors } : { error: errorMessage });
    }
  },

  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const result = await authService.verifyToken({ token });
      res.json(result);
    } catch (error) {
      const status = error.status || 401;
      const result = error.valid !== undefined 
        ? { valid: error.valid, error: error.error || 'Token không hợp lệ' }
        : { valid: false, error: 'Token không hợp lệ' };
      res.status(status).json(result);
    }
  },

  async forgotPassword(req, res) {
    try {
      const result = await authService.forgotPassword(req.body);
      res.json(result);
    } catch (error) {
      console.error('Forgot password error:', error);
      const status = error.status || 500;
      const errorMessage = error.error || 'Lỗi server khi xử lý yêu cầu đặt lại mật khẩu';
      res.status(status).json({ error: errorMessage });
    }
  },

  async resetPassword(req, res) {
    try {
      const result = await authService.resetPassword(req.body);
      res.json(result);
    } catch (error) {
      console.error('Reset password error:', error);
      const status = error.status || 500;
      const errorMessage = error.error || 'Lỗi server khi đặt lại mật khẩu';
      res.status(status).json({ error: errorMessage });
    }
  }
};

module.exports = authController;
