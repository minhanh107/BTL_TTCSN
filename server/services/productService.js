const Product = require('../models/Product');
const attributeService = require('./attributeService');

const productService = {
  // Get products with filters and pagination
  async getProducts(filters = {}, page = 1, limit = 12) {
    const query = { isActive: true };

    // Filter by category
    if (filters.category) {
      query.category = filters.category;
    }

    // Filter by attributes (ObjectIds)
    // Only add filter if value is truthy and not string "null" or "undefined"
    if (filters.brand && filters.brand !== 'null' && filters.brand !== 'undefined') {
      query['attributes.brand'] = filters.brand;
    }
    if (filters.gender && filters.gender !== 'null' && filters.gender !== 'undefined') {
      query['attributes.gender'] = filters.gender;
    }
    if (filters.origin && filters.origin !== 'null' && filters.origin !== 'undefined') {
      query['attributes.origin'] = filters.origin;
    }
    if (filters.concentration && filters.concentration !== 'null' && filters.concentration !== 'undefined') {
      query['attributes.concentration'] = filters.concentration;
    }
    if (filters.perfumer && filters.perfumer !== 'null' && filters.perfumer !== 'undefined') {
      query['attributes.perfumer'] = filters.perfumer;
    }
    if (filters.scentGroup && filters.scentGroup !== 'null' && filters.scentGroup !== 'undefined') {
      query['attributes.scentGroup'] = filters.scentGroup;
    }
    if (filters.style) {
      query['attributes.style'] = { $regex: filters.style, $options: 'i' };
    }

    // Filter by price range
    if (filters.minPrice || filters.maxPrice) {
      query['variants.price'] = {};
      if (filters.minPrice) {
        query['variants.price'].$gte = filters.minPrice;
      }
      if (filters.maxPrice) {
        query['variants.price'].$lte = filters.maxPrice;
      }
    }

    // Search by name or description
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('attributes.brand', 'value')
      .populate('attributes.gender', 'value')
      .populate('attributes.origin', 'value')
      .populate('attributes.concentration', 'value')
      .populate('attributes.perfumer', 'value')
      .populate('attributes.scentGroup', 'value')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // Get product by ID with populated attributes
  async getProductById(id) {
    return await Product.findById(id)
      .populate('category', 'name slug description')
      .populate('attributes.brand', 'value')
      .populate('attributes.gender', 'value')
      .populate('attributes.origin', 'value')
      .populate('attributes.concentration', 'value')
      .populate('attributes.perfumer', 'value')
      .populate('attributes.scentGroup', 'value');
  },

  // Create product with attribute validation
  async createProduct(data) {
    // Validate attributes
    const attributeFields = ['brand', 'gender', 'origin', 'concentration', 'perfumer', 'scentGroup'];
    for (const field of attributeFields) {
      if (data.attributes && data.attributes[field]) {
        const validation = await attributeService.validateAttributeType(
          data.attributes[field],
          field
        );
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }
    }

    const product = new Product(data);
    return await product.save();
  },

  // Update product with attribute validation
  async updateProduct(id, data) {
    // Validate attributes if provided
    if (data.attributes) {
      const attributeFields = ['brand', 'gender', 'origin', 'concentration', 'perfumer', 'scentGroup'];
      for (const field of attributeFields) {
        if (data.attributes[field]) {
          const validation = await attributeService.validateAttributeType(
            data.attributes[field],
            field
          );
          if (!validation.valid) {
            throw new Error(validation.error);
          }
        }
      }
    }

    return await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('category', 'name slug')
      .populate('attributes.brand', 'value')
      .populate('attributes.gender', 'value')
      .populate('attributes.origin', 'value')
      .populate('attributes.concentration', 'value')
      .populate('attributes.perfumer', 'value')
      .populate('attributes.scentGroup', 'value');
  },

  // Delete product (soft delete)
  async deleteProduct(id) {
    return await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }
};

module.exports = productService;

