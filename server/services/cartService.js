const Cart = require('../models/Cart');
const Product = require('../models/Product');

const cartService = {
  // Get user's cart with populated products
  async getUserCart(userId) {
    let cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      populate: {
        path: 'attributes.brand attributes.gender attributes.origin attributes.concentration attributes.perfumer attributes.scentGroup',
        select: 'value'
      }
    });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    return cart;
  },

  // Add item to cart
  async addToCart(userId, productId, variantIndex, quantity) {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId.toString() && item.variantIndex === variantIndex
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, variantIndex, quantity });
    }

    await cart.save();
    
    // Populate products before returning
    return await this.getUserCart(userId);
  },

  // Update item quantity
  async updateItemQuantity(userId, itemId, quantity) {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error('Giỏ hàng không tồn tại');
    }

    const item = cart.items.id(itemId);
    if (!item) {
      throw new Error('Sản phẩm không tồn tại trong giỏ hàng');
    }

    item.quantity = quantity;
    await cart.save();
    
    // Populate products before returning
    return await this.getUserCart(userId);
  },

  // Remove item from cart
  async removeItem(userId, itemId) {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error('Giỏ hàng không tồn tại');
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();
    
    // Populate products before returning
    return await this.getUserCart(userId);
  },

  // Clear cart
  async clearCart(userId) {
    return await Cart.findOneAndUpdate({ userId }, { items: [] }, { new: true });
  }
};

module.exports = cartService;

