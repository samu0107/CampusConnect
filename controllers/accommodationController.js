const Accommodation = require('../models/Accommodation');
const path = require('path');
const fs = require('fs');

// GET /api/accommodations?minPrice=&maxPrice=&maxDistance=&facilities=WiFi,Parking&gender=
exports.getAllAccommodations = async (req, res) => {
  try {
    const { minPrice, maxPrice, maxDistance, facilities, gender, available } = req.query;
    const filter = {};

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (maxDistance) filter.distance = { $lte: Number(maxDistance) };
    if (facilities) {
      const facArr = facilities.split(',').map(f => f.trim());
      filter.facilities = { $all: facArr };
    }
    if (gender && gender !== 'Any') filter.gender = { $in: [gender, 'Any'] };
    if (available !== 'false') filter.isAvailable = true;

    const accommodations = await Accommodation.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: accommodations.length, data: accommodations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/accommodations/:id
exports.getAccommodationById = async (req, res) => {
  try {
    const acc = await Accommodation.findById(req.params.id);
    if (!acc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: acc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/accommodations  (Admin only)
exports.createAccommodation = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length < 2) {
      return res.status(400).json({ success: false, message: 'Minimum 2 photos required' });
    }
    if (files.length > 5) {
      return res.status(400).json({ success: false, message: 'Maximum 5 photos allowed' });
    }

    const photoPaths = files.map(f => `/uploads/accommodations/${f.filename}`);
    const { title, description, price, distance, distanceUnit, address,
            facilities, gender, availableRooms, ownerName, ownerPhone, ownerEmail, ownerUserId } = req.body;

    const acc = await Accommodation.create({
      title, description,
      price: Number(price),
      distance: Number(distance),
      distanceUnit: distanceUnit || 'km',
      address,
      photos: photoPaths,
      facilities: facilities ? JSON.parse(facilities) : [],
      gender: gender || 'Any',
      availableRooms: Number(availableRooms) || 1,
      owner: { name: ownerName, phone: ownerPhone, email: ownerEmail, userId: ownerUserId },
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: acc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/accommodations/:id  (Admin only)
exports.updateAccommodation = async (req, res) => {
  try {
    const acc = await Accommodation.findById(req.params.id);
    if (!acc) return res.status(404).json({ success: false, message: 'Not found' });

    const updateData = { ...req.body };
    if (updateData.facilities) updateData.facilities = JSON.parse(updateData.facilities);
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.distance) updateData.distance = Number(updateData.distance);

    // Handle new photos if uploaded
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(f => `/uploads/accommodations/${f.filename}`);
      const existingPhotos = updateData.keepPhotos ? JSON.parse(updateData.keepPhotos) : [];
      const allPhotos = [...existingPhotos, ...newPhotos];

      if (allPhotos.length < 2) {
        return res.status(400).json({ success: false, message: 'Minimum 2 photos required' });
      }
      if (allPhotos.length > 5) {
        return res.status(400).json({ success: false, message: 'Maximum 5 photos allowed' });
      }

      // Delete removed old photos
      const removedPhotos = acc.photos.filter(p => !existingPhotos.includes(p));
      removedPhotos.forEach(p => {
        const filePath = path.join(__dirname, '..', p);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

      updateData.photos = allPhotos;
    }

    // Build owner object
    if (updateData.ownerName) {
      updateData.owner = {
        name: updateData.ownerName,
        phone: updateData.ownerPhone,
        email: updateData.ownerEmail,
        userId: updateData.ownerUserId || acc.owner.userId
      };
    }

    const updated = await Accommodation.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/accommodations/:id  (Admin only)
exports.deleteAccommodation = async (req, res) => {
  try {
    const acc = await Accommodation.findById(req.params.id);
    if (!acc) return res.status(404).json({ success: false, message: 'Not found' });

    // Delete photo files
    acc.photos.forEach(p => {
      const filePath = path.join(__dirname, '..', p);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await acc.deleteOne();
    res.json({ success: true, message: 'Accommodation deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};