const express = require('express');
const router = express.Router();
const multer = require('multer');
const Post = require('../models/Post');

// Setup File Uploads for Kuppi Materials
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Reusing your existing uploads folder!
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  },
});
const upload = multer({ storage: storage });

// @route   GET /api/posts
// @desc    Get all study support posts (Newest first)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/posts (Handles Text AND File Uploads)
router.post('/', upload.single('mediaFile'), async (req, res) => {
  try {
    const { authorName, content, mediaType } = req.body || {};
    if (!content) return res.status(400).json({ message: 'Content cannot be empty' });

    const newPost = new Post({
      authorName,
      content,
      mediaType: mediaType || 'none',
      mediaUrl: req.file ? req.file.path : null,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/posts/:id (Admin Edit Post)
router.put('/:id', async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content },
      { new: true }
    );
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/posts/:id (Admin Delete Post)
router.delete('/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

