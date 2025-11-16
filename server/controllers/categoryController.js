const Category = require('../models/Category');

const categoryController = {
  // Get all categories
  async getCategories(req, res) {
    try {
      const categories = await Category.find({ isActive: true }).sort({ name: 1 });
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create category
  async createCategory(req, res) {
    try {
      const category = new Category(req.body);
      await category.save();
      res.status(201).json(category);
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ error: 'Danh mục đã tồn tại' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  // Update category
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const category = await Category.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!category) {
        return res.status(404).json({ error: 'Danh mục không tồn tại' });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete category (soft delete)
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const category = await Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
      if (!category) {
        return res.status(404).json({ error: 'Danh mục không tồn tại' });
      }
      res.json({ message: 'Xóa danh mục thành công', category });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = categoryController;

