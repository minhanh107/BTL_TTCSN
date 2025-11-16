const productService = require('../services/productService');

const productController = {
  // Get products with filters
  async getProducts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      
      // Helper function to filter out invalid values
      const getFilterValue = (value) => {
        if (!value || value === 'null' || value === 'undefined' || value === 'all' || value === '') {
          return null;
        }
        return value;
      };

      const filters = {
        category: getFilterValue(req.query.category),
        brand: getFilterValue(req.query.brand),
        gender: getFilterValue(req.query.gender),
        origin: getFilterValue(req.query.origin),
        concentration: getFilterValue(req.query.concentration),
        perfumer: getFilterValue(req.query.perfumer),
        scentGroup: getFilterValue(req.query.scentGroup),
        style: getFilterValue(req.query.style),
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
        search: getFilterValue(req.query.search)
      };

      const result = await productService.getProducts(filters, page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get product by ID
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      if (!product) {
        return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create product
  async createProduct(req, res) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update product
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.updateProduct(id, req.body);
      if (!product) {
        return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete product
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.deleteProduct(id);
      if (!product) {
        return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
      }
      res.json({ message: 'Xóa sản phẩm thành công', product });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = productController;

