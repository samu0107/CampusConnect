const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    authorName: { type: String, required: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    // NEW: Added support for Kuppi videos, images, and documents!
    mediaUrl: { type: String, default: null },
    mediaType: {
      type: String,
      enum: ['none', 'image', 'video', 'document'],
      default: 'none',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);

