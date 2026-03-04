const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, maxlength: 1000 },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  accommodationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Accommodation', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now },
  studentUnread: { type: Number, default: 0 },
  ownerUnread: { type: Number, default: 0 }
}, { timestamps: true });

conversationSchema.index({ accommodationId: 1, studentId: 1, ownerId: 1 }, { unique: true });

module.exports = {
  Message: mongoose.model('Message', messageSchema),
  Conversation: mongoose.model('Conversation', conversationSchema)
};