const express = require('express');
const router = express.Router();
const multer = require('multer');
const Accommodation = require('../models/Accommodation');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  },
});
// Accept up to 5 images
const upload = multer({ storage: storage });

// @route   GET /api/accommodation
router.get('/', async (req, res) => {
  try {
    const places = await Accommodation.find().sort({ createdAt: -1 });
    res.json(places);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/accommodation (Student OR Admin)
router.post('/', upload.array('imageFiles', 5), async (req, res) => {
  try {
    const { title, description, rent, location, address, propertyType, targetGender, ownerName, contactNumber, isAdmin } = req.body;
    const status = isAdmin === 'true' ? 'Approved' : 'Pending';
    const imageUrls = req.files ? req.files.map((file) => file.path) : [];

    const newPlace = new Accommodation({
      title,
      description,
      rent: Number(rent),
      location,
      address,
      propertyType,
      targetGender,
      ownerName,
      contactNumber,
      status,
      imageUrls,
    });
    await newPlace.save();
    res.status(201).json(newPlace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/accommodation/:id/status (Admin Approve/Reject)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedPlace = await Accommodation.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updatedPlace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/accommodation/:id
router.delete('/:id', async (req, res) => {
  try {
    await Accommodation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

