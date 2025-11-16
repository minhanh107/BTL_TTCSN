const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  scentRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  longevityRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  effectivenessRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index để đảm bảo mỗi user chỉ đánh giá 1 lần cho 1 sản phẩm
ratingSchema.index({ userId: 1, productId: 1 }, { unique: true });
ratingSchema.index({ productId: 1 });

module.exports = mongoose.model('Rating', ratingSchema);

