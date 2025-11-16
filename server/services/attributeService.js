const Attribute = require('../models/Attribute');

const attributeService = {
  // Get all attributes or filter by type
  async getAttributes(type = null) {
    const query = type ? { type, isActive: true } : { isActive: true };
    return await Attribute.find(query).sort({ value: 1 });
  },

  // Get attribute by ID
  async getAttributeById(id) {
    return await Attribute.findById(id);
  },

  // Create new attribute
  async createAttribute(data) {
    const attribute = new Attribute(data);
    return await attribute.save();
  },

  // Update attribute
  async updateAttribute(id, data) {
    return await Attribute.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  // Delete attribute (soft delete)
  async deleteAttribute(id) {
    return await Attribute.findByIdAndUpdate(id, { isActive: false }, { new: true });
  },

  // Check if attribute is being used by any product
  async isAttributeInUse(id) {
    const Product = require('../models/Product');
    const attribute = await Attribute.findById(id);
    if (!attribute) return false;

    const query = {
      $or: [
        { 'attributes.brand': id },
        { 'attributes.gender': id },
        { 'attributes.origin': id },
        { 'attributes.concentration': id },
        { 'attributes.perfumer': id },
        { 'attributes.scentGroup': id }
      ]
    };

    const count = await Product.countDocuments(query);
    return count > 0;
  },

  // Validate attribute type matches
  async validateAttributeType(attributeId, expectedType) {
    const attribute = await Attribute.findById(attributeId);
    if (!attribute) {
      return { valid: false, error: 'Attribute không tồn tại' };
    }
    if (attribute.type !== expectedType) {
      return { valid: false, error: `Attribute type không khớp. Mong đợi: ${expectedType}, nhận được: ${attribute.type}` };
    }
    return { valid: true, attribute };
  }
};

module.exports = attributeService;

