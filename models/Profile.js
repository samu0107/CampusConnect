const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  major: { type: String, required: true },
  skills: { type: [String], default: [] },
  githubLink: { type: String },
  cvUrl: { type: String },

  // NEW FIELDS FOR CUSTOMIZATION
  profilePicUrl: { type: String, default: null },
  bio: { type: String, default: 'Passionate tech undergraduate.' },
  phone: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);

