const ratingService = require('../services/ratingService');

const ratingController = {
  // Get product ratings
  async getProductRatings(req, res) {
    try {
      const { productId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await ratingService.getProductRatings(productId, page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get product rating stats
  async getProductRatingStats(req, res) {
    try {
      const { productId } = req.params;
      const stats = await ratingService.getProductRatingStats(productId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create or update rating
  async createOrUpdateRating(req, res) {
    try {
      const userId = req.user.id;
      const { productId, scentRating, longevityRating, effectivenessRating, comment } = req.body;

      if (!productId || !scentRating || !longevityRating || !effectivenessRating) {
        return res.status(400).json({ error: 'Thiếu thông tin đánh giá' });
      }

      if (scentRating < 1 || scentRating > 5 || 
          longevityRating < 1 || longevityRating > 5 || 
          effectivenessRating < 1 || effectivenessRating > 5) {
        return res.status(400).json({ error: 'Đánh giá phải từ 1 đến 5 sao' });
      }

      const rating = await ratingService.createOrUpdateRating(userId, productId, {
        scentRating,
        longevityRating,
        effectivenessRating,
        comment
      });

      res.status(201).json(rating);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get user's rating for a product
  async getUserRating(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.params;
      const rating = await ratingService.getUserRating(userId, productId);
      res.json(rating);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete rating
  async deleteRating(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      await ratingService.deleteRating(id, userId);
      res.json({ message: 'Xóa đánh giá thành công' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = ratingController;

