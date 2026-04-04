const express = require('express');
const router = express.Router();
const multer = require('multer');
const MarketplaceItem = require('../models/MarketplaceItem');

// Setup Image Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  },
});
const upload = multer({ storage: storage });

// @route   GET /api/marketplace
router.get('/', async (req, res) => {
  try {
    const items = await MarketplaceItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/marketplace
router.post('/', upload.single('imageFile'), async (req, res) => {
  try {
    const { title, description, price, category, sellerName, sellerContact } = req.body;

    const newItem = new MarketplaceItem({
      title,
      description,
      price: Number(price),
      category,
      sellerName,
      sellerContact,
      imageUrl: req.file ? req.file.path : null,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/marketplace/:id
router.delete('/:id', async (req, res) => {
  try {
    await MarketplaceItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/marketplace/:id (Admin Edit Item)
router.put('/:id', upload.single('imageFile'), async (req, res) => {
  try {
    const { title, description, price, category, sellerName, sellerContact } = req.body || {};

    // Build the update object
    const updateData = {
      title,
      description,
      price: price !== undefined ? Number(price) : undefined,
      category,
      sellerName,
      sellerContact,
    };

    // Remove undefined fields so we don't accidentally overwrite values
    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

    // If the admin uploaded a new image, update that too!
    if (req.file) {
      updateData.imageUrl = req.file.path;
    }

    const updatedItem = await MarketplaceItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

