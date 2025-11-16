const productService = require('../services/productService');

const searchController = {
  // Search products
  async searchProducts(req, res) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ error: 'Thiếu từ khóa tìm kiếm' });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const filters = { search: q };

      const result = await productService.getProducts(filters, page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = searchController;

