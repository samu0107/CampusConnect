const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['Accommodation', 'Job', 'System'], default: 'System' },
    isRead: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Notification', NotificationSchema);
