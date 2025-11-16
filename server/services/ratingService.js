const Rating = require('../models/Rating');

const ratingService = {
  // Get ratings for a product
  async getProductRatings(productId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const ratings = await Rating.find({ productId })
      .populate('userId', 'username name picture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Rating.countDocuments({ productId });

    return {
      ratings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // Get rating stats for a product
  async getProductRatingStats(productId) {
    const ratings = await Rating.find({ productId });

    if (ratings.length === 0) {
      return {
        count: 0,
        averageScentRating: 0,
        averageLongevityRating: 0,
        averageEffectivenessRating: 0,
        overallAverage: 0
      };
    }

    const totalScent = ratings.reduce((sum, r) => sum + r.scentRating, 0);
    const totalLongevity = ratings.reduce((sum, r) => sum + r.longevityRating, 0);
    const totalEffectiveness = ratings.reduce((sum, r) => sum + r.effectivenessRating, 0);

    const count = ratings.length;
    const averageScentRating = totalScent / count;
    const averageLongevityRating = totalLongevity / count;
    const averageEffectivenessRating = totalEffectiveness / count;
    const overallAverage = (averageScentRating + averageLongevityRating + averageEffectivenessRating) / 3;

    return {
      count,
      averageScentRating: Math.round(averageScentRating * 10) / 10,
      averageLongevityRating: Math.round(averageLongevityRating * 10) / 10,
      averageEffectivenessRating: Math.round(averageEffectivenessRating * 10) / 10,
      overallAverage: Math.round(overallAverage * 10) / 10
    };
  },

  // Check if user has rated product
  async hasUserRated(userId, productId) {
    const rating = await Rating.findOne({ userId, productId });
    return !!rating;
  },

  // Create or update rating
  async createOrUpdateRating(userId, productId, ratingData) {
    const rating = await Rating.findOne({ userId, productId });

    if (rating) {
      // Update existing rating
      rating.scentRating = ratingData.scentRating;
      rating.longevityRating = ratingData.longevityRating;
      rating.effectivenessRating = ratingData.effectivenessRating;
      rating.comment = ratingData.comment;
      return await rating.save();
    } else {
      // Create new rating
      const newRating = new Rating({
        userId,
        productId,
        ...ratingData
      });
      return await newRating.save();
    }
  },

  // Get user's rating for a product
  async getUserRating(userId, productId) {
    return await Rating.findOne({ userId, productId })
      .populate('userId', 'username name picture');
  },

  // Delete rating
  async deleteRating(ratingId, userId) {
    const rating = await Rating.findById(ratingId);
    if (!rating) {
      throw new Error('Đánh giá không tồn tại');
    }
    if (rating.userId.toString() !== userId.toString()) {
      throw new Error('Không có quyền xóa đánh giá này');
    }
    return await Rating.findByIdAndDelete(ratingId);
  }
};

module.exports = ratingService;

