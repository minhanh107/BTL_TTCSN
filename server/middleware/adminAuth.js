const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/User');

// Middleware to check if user is admin
// This should be used after verifyToken middleware
async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ error: 'Người dùng không tồn tại' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi xác thực quyền admin' });
  }
}

module.exports = { requireAdmin };

