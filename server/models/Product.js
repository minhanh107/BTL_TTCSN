const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  attributes: {
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attribute'
    },
    gender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attribute'
    },
    origin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attribute'
    },
    concentration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attribute'
    },
    perfumer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attribute'
    },
    scentGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attribute'
    },
    style: {
      type: String,
      trim: true
    }
  },
  variants: [{
    volume: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  images: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ 'attributes.brand': 1 });
productSchema.index({ 'attributes.gender': 1 });
productSchema.index({ 'attributes.scentGroup': 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);

