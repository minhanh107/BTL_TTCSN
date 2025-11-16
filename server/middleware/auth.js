const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

// Verify JWT token
function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Không có token xác thực' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { 
      id: user._id ? user._id.toString() : (user.id || user.email),
      email: user.email,
      username: user.username 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

module.exports = {
  verifyToken,
  generateToken
};
