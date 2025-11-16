const mongoose = require('mongoose');

const attributeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['brand', 'gender', 'origin', 'concentration', 'perfumer', 'scentGroup'],
    required: true,
    index: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index để đảm bảo không trùng lặp value cho cùng type
attributeSchema.index({ type: 1, value: 1 }, { unique: true });

module.exports = mongoose.model('Attribute', attributeSchema);

