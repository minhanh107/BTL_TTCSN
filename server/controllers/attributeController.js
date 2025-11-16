const attributeService = require('../services/attributeService');

const attributeController = {
  // Get all attributes or by type
  async getAttributes(req, res) {
    try {
      const { type } = req.query;
      const attributes = await attributeService.getAttributes(type);
      res.json(attributes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get attributes by type
  async getAttributesByType(req, res) {
    try {
      const { type } = req.params;
      const attributes = await attributeService.getAttributes(type);
      res.json(attributes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create attribute
  async createAttribute(req, res) {
    try {
      const attribute = await attributeService.createAttribute(req.body);
      res.status(201).json(attribute);
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ error: 'Attribute đã tồn tại' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  // Update attribute
  async updateAttribute(req, res) {
    try {
      const { id } = req.params;
      const attribute = await attributeService.updateAttribute(id, req.body);
      if (!attribute) {
        return res.status(404).json({ error: 'Attribute không tồn tại' });
      }
      res.json(attribute);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete attribute
  async deleteAttribute(req, res) {
    try {
      const { id } = req.params;
      
      // Check if attribute is in use
      const inUse = await attributeService.isAttributeInUse(id);
      if (inUse) {
        return res.status(400).json({ error: 'Không thể xóa attribute đang được sử dụng bởi sản phẩm' });
      }

      const attribute = await attributeService.deleteAttribute(id);
      if (!attribute) {
        return res.status(404).json({ error: 'Attribute không tồn tại' });
      }
      res.json({ message: 'Xóa attribute thành công', attribute });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = attributeController;

