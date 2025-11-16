const express = require('express');
const router = express.Router();
const attributeController = require('../controllers/attributeController');
const { verifyToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');

// Public routes
router.get('/', attributeController.getAttributes);
router.get('/:type', attributeController.getAttributesByType);

// Admin routes
router.post('/', verifyToken, requireAdmin, attributeController.createAttribute);
router.put('/:id', verifyToken, requireAdmin, attributeController.updateAttribute);
router.delete('/:id', verifyToken, requireAdmin, attributeController.deleteAttribute);

module.exports = router;

