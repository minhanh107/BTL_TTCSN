const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  picture: {
    type: String
  },
  name: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  fullName: {
    type: String
  }
}, {
  timestamps: true
});

// Pre-save validation: password is required if no googleId
userSchema.pre('validate', function(next) {
  if (!this.googleId && !this.password) {
    return next(new Error('Password is required for non-Google OAuth users'));
  }
  next();
});

module.exports = mongoose.model('User', userSchema);

