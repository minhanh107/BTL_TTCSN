const cartService = require('../services/cartService');

const cartController = {
  // Get user's cart
  async getCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await cartService.getUserCart(userId);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Add to cart
  async addToCart(req, res) {
    try {
      const userId = req.user.id;
      const { productId, variantIndex, quantity } = req.body;

      if (!productId || variantIndex === undefined || !quantity) {
        return res.status(400).json({ error: 'Thiếu thông tin sản phẩm' });
      }

      const cart = await cartService.addToCart(userId, productId, variantIndex, quantity);
      res.json(cart);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update item quantity
  async updateItemQuantity(req, res) {
    try {
      const userId = req.user.id;
      const { itemId } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({ error: 'Số lượng không hợp lệ' });
      }

      const cart = await cartService.updateItemQuantity(userId, itemId, quantity);
      res.json(cart);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Remove item
  async removeItem(req, res) {
    try {
      const userId = req.user.id;
      const { itemId } = req.params;
      const cart = await cartService.removeItem(userId, itemId);
      res.json(cart);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Clear cart
  async clearCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await cartService.clearCart(userId);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = cartController;

