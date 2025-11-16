const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.get('/product/:productId', ratingController.getProductRatings);
router.get('/product/:productId/stats', ratingController.getProductRatingStats);

// Authenticated routes
router.post('/', verifyToken, ratingController.createOrUpdateRating);
router.get('/user/:productId', verifyToken, ratingController.getUserRating);
router.delete('/:id', verifyToken, ratingController.deleteRating);

module.exports = router;

