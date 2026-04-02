const express = require('express');
const multer = require('multer');
const path = require('path');
const Application = require('../models/Application');

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Business Rule Violation: Only PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/', upload.single('cvFile'), async (req, res) => {
  try {
    const { jobId, studentId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'CV upload is mandatory and must be a PDF.' });
    }

    const newApp = new Application({
      jobId,
      studentId,
      cvUrl: req.file.path,
      status: 'Pending',
    });

    await newApp.save();
    return res
      .status(201)
      .json({ message: 'Application submitted successfully!', application: newApp });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('jobId', 'title company')
      .sort({ createdAt: -1 });

    return res.json(applications);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    ).populate('jobId', 'title company');

    return res.json(updatedApplication);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/applications/student/:studentId
// @desc    Get all applications for a specific student
router.get('/student/:studentId', async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.params.studentId })
      .populate('jobId', 'title company jobType')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

