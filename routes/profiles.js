const express = require('express');
const router = express.Router();
const multer = require('multer');
const Profile = require('../models/Profile');

// Upgraded Storage to handle different file names cleanly
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});
const upload = multer({ storage });

// @route   GET /api/profiles/:studentId
router.get('/:studentId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ studentId: req.params.studentId });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/profiles (Create or Update with Avatar & CV)
router.post('/', upload.fields([{ name: 'cvFile', maxCount: 1 }, { name: 'profilePic', maxCount: 1 }]), async (req, res) => {
  try {
    const { studentId, fullName, major, skills, githubLink, bio, phone } = req.body;
    
    const skillsArray = skills ? skills.split(',').map(s => s.trim().toLowerCase()) : [];

    let updateData = { studentId, fullName, major, skills: skillsArray, githubLink, bio, phone };
    
    // Check if a new CV was uploaded
    if (req.files && req.files['cvFile']) {
      updateData.cvUrl = req.files['cvFile'][0].path;
    }
    
    // Check if a new Profile Picture was uploaded
    if (req.files && req.files['profilePic']) {
      updateData.profilePicUrl = req.files['profilePic'][0].path;
    }

    const profile = await Profile.findOneAndUpdate(
      { studentId },
      { $set: updateData },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

