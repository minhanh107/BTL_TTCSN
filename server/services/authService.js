const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userService = require('./userService');
const otpService = require('./otpService');
const passwordResetService = require('./passwordResetService');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { generateOTP, isOTPExpired } = require('../utils/otp');
const { sendOTPEmail, sendPasswordResetEmail } = require('../utils/email');
const { generateToken } = require('../middleware/auth');
const { JWT_SECRET, FRONTEND_URL } = require('../config');

const authService = {
  async register({ username, email, password, confirmPassword }) {
    // Validate input
    const validation = validateRegistration({ username, email, password, confirmPassword });
    if (!validation.valid) {
      throw { status: 400, errors: validation.errors };
    }

    // Check if user already exists
    const existingUserByEmail = await userService.findUserByEmail(email);
    if (existingUserByEmail) {
      throw { status: 400, error: 'Email đã được sử dụng' };
    }

    const existingUserByUsername = await userService.findUserByUsername(username);
    if (existingUserByUsername) {
      throw { status: 400, error: 'Tên người dùng đã được sử dụng' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (unverified)
    const user = await userService.createUser({
      username,
      email,
      password: hashedPassword,
      verified: false
    });

    // Generate and send OTP
    const otp = generateOTP();
    await otpService.createOTP(email, otp, user._id);

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp);
    if (!emailResult.success) {
      throw { status: 500, error: 'Không thể gửi email OTP' };
    }

    // Clean expired OTPs
    await otpService.cleanExpiredOTPs();

    return {
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP.',
      email
    };
  },

  async verifyOTP({ email, code }) {
    if (!email || !code) {
      throw { status: 400, error: 'Email và mã OTP là bắt buộc' };
    }

    // Clean expired OTPs first
    await otpService.cleanExpiredOTPs();

    // Find OTP
    const otpRecord = await otpService.findOTP(email, code);
    if (!otpRecord) {
      throw { status: 400, error: 'Mã OTP không hợp lệ' };
    }

    // Check if OTP is expired
    if (isOTPExpired(otpRecord.expiresAt)) {
      await otpService.deleteOTP(email, code);
      throw { status: 400, error: 'Mã OTP đã hết hạn' };
    }

    // Update user to verified
    const user = await userService.findUserByEmail(email);
    if (!user) {
      throw { status: 404, error: 'Người dùng không tồn tại' };
    }

    await userService.verifyUser(email);

    // Delete used OTP
    await otpService.deleteOTP(email, code);

    // Generate token
    const token = generateToken(user);

    return {
      message: 'Xác thực thành công',
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role || 'user'
      }
    };
  },

  async resendOTP({ email }) {
    if (!email) {
      throw { status: 400, error: 'Email là bắt buộc' };
    }

    // Check if user exists
    const user = await userService.findUserByEmail(email);
    if (!user) {
      throw { status: 404, error: 'Người dùng không tồn tại' };
    }

    if (user.verified) {
      throw { status: 400, error: 'Tài khoản đã được xác thực' };
    }

    // Generate new OTP
    const otp = generateOTP();
    await otpService.createOTP(email, otp, user._id);

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp);
    if (!emailResult.success) {
      throw { status: 500, error: 'Không thể gửi email OTP' };
    }

    // Clean expired OTPs
    await otpService.cleanExpiredOTPs();

    return { message: 'Mã OTP mới đã được gửi đến email của bạn' };
  },

  async login({ email, password }) {
    // Validate input
    const validation = validateLogin({ email, password });
    if (!validation.valid) {
      throw { status: 400, errors: validation.errors };
    }

    // Find user
    const user = await userService.findUserByEmail(email);
    if (!user) {
      throw { status: 401, error: 'Email hoặc mật khẩu không đúng' };
    }

    // Check if account is verified
    if (!user.verified) {
      throw { status: 403, error: 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực.' };
    }

    // Check if user is Google OAuth user (no password)
    if (user.googleId && !user.password) {
      throw { status: 401, error: 'Tài khoản này đăng nhập bằng Google. Vui lòng sử dụng đăng nhập Google.' };
    }

    // Check if user has password
    if (!user.password) {
      throw { status: 401, error: 'Email hoặc mật khẩu không đúng' };
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw { status: 401, error: 'Email hoặc mật khẩu không đúng' };
    }

    // Generate token
    const token = generateToken(user);

    return {
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role || 'user'
      }
    };
  },

  async verifyToken({ token }) {
    if (!token) {
      throw { status: 401, valid: false, error: 'Không có token' };
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw { status: 401, valid: false, error: 'Token không hợp lệ' };
    }

    // Get user from database to ensure they still exist
    const user = await userService.findUserByEmail(decoded.email);
    if (!user) {
      throw { status: 401, valid: false, error: 'Người dùng không tồn tại' };
    }

    return {
      valid: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role || 'user'
      }
    };
  },

  async forgotPassword({ email }) {
    if (!email) {
      throw { status: 400, error: 'Email là bắt buộc' };
    }

    // Check if user exists and is verified
    const user = await userService.findUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return { message: 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.' };
    }

    if (!user.verified) {
      throw { status: 400, error: 'Tài khoản chưa được xác thực. Vui lòng xác thực tài khoản trước.' };
    }

    // Create reset token
    const resetToken = await passwordResetService.createResetToken(email);

    // Generate reset URL
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken.token}`;

    // Send reset email
    const emailResult = await sendPasswordResetEmail(email, resetToken.token, resetUrl);
    if (!emailResult.success) {
      throw { status: 500, error: 'Không thể gửi email đặt lại mật khẩu' };
    }

    return { message: 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.' };
  },

  async resetPassword({ token, password, confirmPassword }) {
    if (!token || !password || !confirmPassword) {
      throw { status: 400, error: 'Token, mật khẩu và xác nhận mật khẩu là bắt buộc' };
    }

    if (password !== confirmPassword) {
      throw { status: 400, error: 'Mật khẩu xác nhận không khớp' };
    }

    // Validate password strength
    const passwordValidation = require('../middleware/validation').validatePassword(password);
    if (!passwordValidation.valid) {
      throw { status: 400, error: passwordValidation.message };
    }

    // Find reset token
    const resetToken = await passwordResetService.findResetToken(token);
    if (!resetToken) {
      throw { status: 400, error: 'Token không hợp lệ hoặc đã hết hạn' };
    }

    // Check if token is expired
    if (new Date() > new Date(resetToken.expiresAt)) {
      throw { status: 400, error: 'Token đã hết hạn' };
    }

    // Check if token is already used
    if (resetToken.used) {
      throw { status: 400, error: 'Token đã được sử dụng' };
    }

    // Update user password
    await userService.updatePassword(resetToken.email, password);

    // Mark token as used
    await passwordResetService.markTokenAsUsed(token);

    return { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.' };
  }
};

module.exports = authService;

